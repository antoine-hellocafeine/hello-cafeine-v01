'use client'

import { useRef, useEffect } from 'react'
import {
	useGLTF,
	PerspectiveCamera,
	Environment,
	Float,
	useAnimations,
	useTexture,
	SpotLight,
} from '@react-three/drei'
import {
	EffectComposer,
	ToneMapping,
	HueSaturation,
	Bloom,
	BrightnessContrast,
	SSAO,
} from '@react-three/postprocessing'
import { BlendFunction, KernelSize, Resolution } from 'postprocessing'
import { useFrame, Canvas } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'
import { Perf } from 'r3f-perf'

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
			castShadow
		/>
	)
}

const StarModel = ({ onReady }) => {
	const modelRef = useRef()
	const { scene, animations } = useGLTF('/glb/star.glb')
	const { actions } = useAnimations(animations, scene)

	useEffect(() => {
		// Ensure materials are set up properly for post-processing
		if (scene) {
			scene.traverse((child) => {
				if (child.isMesh) {
					// Ensure the material writes to depth buffer
					child.material.depthWrite = true
					child.material.depthTest = true
					// Force material to be visible to post-processing
					child.material.transparent = false
				}
			})
		}

		if (modelRef.current && onReady) {
			onReady(modelRef.current)
		}
	}, [scene, onReady])

	return (
		<Float speed={2.4} floatIntensity={0.8} rotationIntensity={0.6}>
			<group>
				<primitive
					ref={modelRef}
					object={scene}
					scale={0.8}
					position={[0, -4, 0]}
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
			{/* <EffectComposer enableNormalPass>
				<ToneMapping
					blendFunction={BlendFunction.NORMAL}
					adaptive={true}
					resolution={256}
					middleGrey={0.6}
					maxLuminance={16.0}
					averageLuminance={1.0}
					adaptationRate={1.0}
				/>
				<Bloom
					intensity={1.0}
					kernelSize={KernelSize.LARGE}
					luminanceThreshold={0.9}
					luminanceSmoothing={0.025}
					mipmapBlur={false}
				/>
				<HueSaturation
					blendFunction={BlendFunction.NORMAL}
					hue={0}
					saturation={0.1} // Slight saturation boost
				/>
				<BrightnessContrast
					brightness={0}
					contrast={0.1} // Slight contrast boost
				/>
				<SSAO
					blendFunction={BlendFunction.MULTIPLY}
					samples={8}
					rings={4}
					distanceThreshold={1.0}
					distanceFalloff={0.0}
					rangeThreshold={0.5}
					rangeFalloff={0.1}
					luminanceInfluence={0.9}
					radius={20}
					scale={0.5}
					bias={0.5}
				/>
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
				}}
				shadows
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
				<StarScene onModelReady={onModelReady} />
				{/* <Perf position="top-left" /> */}
			</Canvas>
		</div>
	)
}
