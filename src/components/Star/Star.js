'use client'

import { useRef, useEffect, Suspense, useState } from 'react'
import {
	useGLTF,
	PerspectiveCamera,
	Environment,
	Float,
	useTexture,
	SpotLight,
} from '@react-three/drei'
import { easing } from 'maath'
import {
	EffectComposer,
	ToneMapping,
	HueSaturation,
	Bloom,
	BrightnessContrast,
	SSAO,
} from '@react-three/postprocessing'
import { BlendFunction, KernelSize, Resolution } from 'postprocessing'
import { useFrame, Canvas, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'
// import { Perf } from 'r3f-perf'

function GoboSpotlight() {
	const spotlightRef = useRef()
	const decayValue = useRef(0.59)
	const goboTexture = useTexture('/gobo-pattern.webp', (texture) => {
		texture.generateMipmaps = false // If texture is power-of-2
		texture.flipY = false
	})

	goboTexture.wrapS = goboTexture.wrapT = THREE.RepeatWrapping
	goboTexture.magFilter = THREE.LinearFilter
	goboTexture.minFilter = THREE.LinearMipmapLinearFilter

	useEffect(() => {
		const timeline = gsap.timeline({
			repeat: -1,
			yoyo: true,
			ease: 'sine.inOut',
		})

		timeline
			.to(decayValue, {
				current: 0.72,
				duration: 5,
				ease: 'sine.inOut',
			})
			.to(decayValue, {
				current: 0.4,
				duration: 5,
				ease: 'sine.inOut',
			})

		return () => {
			timeline.kill()
		}
	}, [])

	useFrame(() => {
		if (spotlightRef.current) {
			spotlightRef.current.decay = decayValue.current
		}
	})

	return (
		<SpotLight
			ref={spotlightRef}
			intensity={400}
			angle={0.28}
			penumbra={0.5}
			distance={100}
			decay={0.59}
			position={[10, 8, 6]}
			color={'#b0af9e'}
			map={goboTexture}
			// castShadow
		/>
	)
}

const StarModel = ({ onReady }) => {
	const intensity = 0.16
	const damp = 0.14
	const lerpFactor = 0.1
	const modelRef = useRef()
	const groupRef = useRef()
	const { scene } = useGLTF('/glb/star-transformed.glb', true)

	const [dummy] = useState(() => new THREE.Object3D())
	const { gl } = useThree()
	const [pointer, setPointer] = useState({ x: 0, y: 0 })
	const smoothPointer = useRef({ x: 0, y: 0 })
	const lookAtTarget = useRef(new THREE.Vector3(0, 0, 1))

	// Track the mouse position relative to the canvas
	useEffect(() => {
		const handleMouseMove = (event) => {
			// Get canvas bounding rect
			const rect = gl.domElement.getBoundingClientRect()

			// Calculate normalized coordinates (-1 to 1)
			const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
			const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

			setPointer({ x, y })
		}

		// Add event listener to the actual DOM element containing the canvas
		window.addEventListener('mousemove', handleMouseMove)

		return () => {
			window.removeEventListener('mousemove', handleMouseMove)
		}
	}, [gl])

	useFrame((_, dt) => {
		// Smooth the pointer movement using lerp
		smoothPointer.current.x += (pointer.x - smoothPointer.current.x) * lerpFactor
		smoothPointer.current.y += (pointer.y - smoothPointer.current.y) * lerpFactor

		// Calculate target position based on smoothed pointer
		const targetX = smoothPointer.current.x * intensity
		const targetY = smoothPointer.current.y * intensity

		// Smooth the lookAt target using lerp
		lookAtTarget.current.x += (targetX - lookAtTarget.current.x) * lerpFactor
		lookAtTarget.current.y += (targetY - lookAtTarget.current.y) * lerpFactor

		// Make dummy look at the smoothed target position
		dummy.lookAt(lookAtTarget.current)

		// Easing the model's rotation toward the dummy's rotation
		if (groupRef.current) {
			easing.dampQ(groupRef.current.quaternion, dummy.quaternion, damp, dt)
		}
	})

	useEffect(() => {
		// Ensure materials are set up properly for post-processing
		// if (scene) {
		// 	scene.traverse((child) => {
		// 		if (child.isMesh) {
		// 			// Ensure the material writes to depth buffer
		// 			child.material.depthWrite = true
		// 			child.material.depthTest = true
		// 			// Force material to be visible to post-processing
		// 			child.material.transparent = false
		// 		}
		// 	})
		// }

		const setDoubleSided = (object) => {
			if (object.material) {
				object.material.side = THREE.DoubleSide
			}

			if (object.children) {
				object.children.forEach((child) => {
					setDoubleSided(child)
				})
			}
		}

		setDoubleSided(modelRef.current)

		if (modelRef.current && onReady) {
			onReady(modelRef.current)
		}
	}, [scene, onReady])

	return (
		<Float speed={2.4} floatIntensity={0.8} rotationIntensity={0.6}>
			<group ref={groupRef}>
				<primitive
					ref={modelRef}
					object={scene}
					scale={window.innerWidth < 1024 ? 0.42 : 0.76}
					position={[0, window.innerWidth < 1024 ? 4 : -4, 0]}
					rotation={[0, Math.PI * 2, 0]}
				/>
			</group>
		</Float>
	)
}

StarModel.displayName = 'StarModel'

// Inner component that contains the 3D scene
function StarScene({ onModelReady }) {
	return (
		<>
			<Environment background={false} environmentIntensity={0.1} preset="park" />
			<GoboSpotlight />

			{/* Camera */}
			<PerspectiveCamera makeDefault fov={40} position={[0, 0, 6]} />

			{/* Model */}
			<StarModel onReady={onModelReady} />

			{/* Post-processing effects MUST be last in the scene */}

			{/* <EffectComposer>
				<ToneMapping
					blendFunction={BlendFunction.LINEAR_DODGE}
					adaptive={true}
					resolution={352}
					middleGrey={0.1}
					maxLuminance={20.0}
					averageLuminance={0.3}
					adaptationRate={0.6}
				/>
				<HueSaturation blendFunction={BlendFunction.NORMAL} hue={-0.2} saturation={0.22} />
			</EffectComposer> */}
		</>
	)
}

// Main component
export default function Star({ viewRef, onModelReady }) {
	return (
		<div ref={viewRef}>
			<Canvas
				gl={{
					antialias: true,
					toneMapping: THREE.ACESFilmicToneMapping,
					outputColorSpace: THREE.SRGBColorSpace,
					powerPreference: 'high-performance', // Use discrete GPU
					alpha: true,
				}}
				shadows={true}
				dpr={[1, 2]}
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100vw',
					height: '100vh',
					overflow: 'hidden',
					pointerEvents: 'none',
					zIndex: 200,
					background: 'transparent',
				}}
			>
				<Suspense fallback={null}>
					<StarScene onModelReady={onModelReady} />
					{/* <Perf position="top-left" /> */}
				</Suspense>
			</Canvas>
		</div>
	)
}
