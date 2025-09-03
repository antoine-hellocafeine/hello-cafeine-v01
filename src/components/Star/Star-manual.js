'use client'

import { useRef, useEffect } from 'react'
import {
	View,
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
import { useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'

import styles from './Star.module.scss'

function GoboSpotlight({ ref }) {
	const spotlightRef = useRef()
	const decayValue = useRef(0.59)
	const goboTexture = useTexture('/gobo-pattern.webp')

	goboTexture.wrapS = goboTexture.wrapT = THREE.RepeatWrapping
	goboTexture.magFilter = THREE.LinearFilter
	goboTexture.minFilter = THREE.LinearMipmapLinearFilter

	// Setup decay animation on mount
	useEffect(() => {
		const timeline = gsap.timeline({
			repeat: -1,
			yoyo: true,
			ease: 'sine.inOut',
		})

		// Animate between 0.3 and 0.8 with 0.59 as the base
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

	// Apply the animated decay value to the spotlight
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
		if (modelRef.current && onReady) {
			onReady(modelRef.current)
		}
	}, [onReady])

	return (
		<>
			<Float speed={2.4} floatIntensity={0.8} rotationIntensity={0.6}>
				<group>
					<primitive
						ref={modelRef}
						object={scene.clone()}
						scale={0.72}
						position={[0, -4, 0]}
						rotation={[0, Math.PI * 2, 0]}
					/>
				</group>
			</Float>
			<Environment renderPriority={1} background={false} environmentIntensity={0.1} preset="park" />
			<GoboSpotlight />
			<EffectComposer renderPriority={1} enableNormalPass={true}>
				<ToneMapping
					blendFunction={BlendFunction.NORMAL}
					adaptive={true}
					resolution={352}
					middleGrey={0.1}
					maxLuminance={20.0}
					averageLuminance={0.3}
					adaptationRate={0.6}
				/>
				<HueSaturation blendFunction={BlendFunction.NORMAL} hue={-0.2} saturation={0.22} />
				<Bloom
					intensity={0.2} // The bloom intensity.
					blurPass={undefined} // A blur pass.
					kernelSize={KernelSize.LARGE} // blur kernel size
					luminanceThreshold={0.9} // luminance threshold. Raise this value to mask out darker elements in the scene.
					luminanceSmoothing={0.025} // smoothness of the luminance threshold. Range is [0, 1]
					mipmapBlur={false} // Enables or disables mipmap blur.
					resolutionX={Resolution.AUTO_SIZE} // The horizontal resolution.
					resolutionY={Resolution.AUTO_SIZE} // The vertical resolution.
				/>
				<BrightnessContrast
					brightness={-1} // brightness. min: -1, max: 1
					contrast={1} // contrast: min -1, max: 1
				/>
				<SSAO
					blendFunction={BlendFunction.MULTIPLY} // blend mode
					samples={30} // amount of samples per pixel (shouldn't be a multiple of the ring count)
					rings={4} // amount of rings in the occlusion sampling pattern
					distanceThreshold={1.0} // global distance threshold at which the occlusion effect starts to fade out. min: 0, max: 1
					distanceFalloff={0.0} // distance falloff. min: 0, max: 1
					rangeThreshold={0.5} // local occlusion range threshold at which the occlusion starts to fade out. min: 0, max: 1
					rangeFalloff={0.1} // occlusion range falloff. min: 0, max: 1
					luminanceInfluence={0.9} // how much the luminance of the scene influences the ambient occlusion
					radius={20} // occlusion sampling radius
					scale={0.5} // scale of the ambient occlusion
					bias={0.5} // occlusion bias
				/>
			</EffectComposer>
			<PerspectiveCamera makeDefault fov={40} position={[0, 0, 6]} />
		</>
	)
}

StarModel.displayName = 'StarModel'

export default function Star({ viewRef, onModelReady }) {
	return (
		<View ref={viewRef} className={styles.star}>
			<StarModel onReady={onModelReady} />
		</View>
	)
}
