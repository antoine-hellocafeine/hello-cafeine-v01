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
import * as THREE from 'three'
import { useControls, folder } from 'leva'

import styles from './Star.module.scss'

function GoboSpotlight() {
	const spotlightRef = useRef()
	const goboTexture = useTexture('/gobo-pattern.webp')

	goboTexture.wrapS = goboTexture.wrapT = THREE.RepeatWrapping
	goboTexture.magFilter = THREE.LinearFilter
	goboTexture.minFilter = THREE.LinearMipmapLinearFilter

	// Spotlight controls
	const spotlightControls = useControls('Spotlight', {
		intensity: { value: 400, min: 0, max: 1000, step: 10 },
		angle: { value: 0.28, min: 0, max: Math.PI / 2, step: 0.01 },
		penumbra: { value: 0.5, min: 0, max: 1, step: 0.01 },
		distance: { value: 100, min: 0, max: 200, step: 1 },
		decay: { value: 0.59, min: 0, max: 2, step: 0.01 },
		positionX: { value: 10, min: -20, max: 20, step: 0.1 },
		positionY: { value: 8, min: -20, max: 20, step: 0.1 },
		positionZ: { value: 6, min: -20, max: 20, step: 0.1 },
		color: '#b0af9e',
	})

	return (
		<SpotLight
			ref={spotlightRef}
			intensity={spotlightControls.intensity}
			angle={spotlightControls.angle}
			penumbra={spotlightControls.penumbra}
			distance={spotlightControls.distance}
			decay={spotlightControls.decay}
			position={[
				spotlightControls.positionX,
				spotlightControls.positionY,
				spotlightControls.positionZ,
			]}
			color={spotlightControls.color}
			map={goboTexture}
			castShadow
		/>
	)
}

const StarModel = ({ onReady }) => {
	const modelRef = useRef()
	const { scene, animations } = useGLTF('/glb/star.glb')
	const { actions } = useAnimations(animations, scene)

	// Model and animation controls
	const modelControls = useControls('Model', {
		scale: { value: 0.72, min: 0.1, max: 2, step: 0.01 },
		positionX: { value: 0, min: -10, max: 10, step: 0.1 },
		positionY: { value: -4, min: -10, max: 10, step: 0.1 },
		positionZ: { value: 0, min: -10, max: 10, step: 0.1 },
		rotationX: { value: 0, min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 },
		rotationY: { value: Math.PI * 2, min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 },
		rotationZ: { value: 0, min: -Math.PI * 2, max: Math.PI * 2, step: 0.01 },
	})

	// Float controls
	const floatControls = useControls('Float Animation', {
		enabled: { value: true, label: 'Enable Float' },
		speed: { value: 2.4, min: 0, max: 10, step: 0.1 },
		floatIntensity: { value: 0.8, min: 0, max: 5, step: 0.1 },
		rotationIntensity: { value: 0.6, min: 0, max: 2, step: 0.1 },
	})

	// Environment controls
	const envControls = useControls('Environment', {
		environmentIntensity: { value: 0.1, min: 0, max: 1, step: 0.01 },
		preset: {
			value: 'park',
			options: [
				'park',
				'sunset',
				'dawn',
				'night',
				'warehouse',
				'forest',
				'apartment',
				'studio',
				'city',
				'lobby',
			],
		},
	})

	// Camera controls
	const cameraControls = useControls('Camera', {
		fov: { value: 40, min: 10, max: 120, step: 1 },
		positionX: { value: 0, min: -20, max: 20, step: 0.1 },
		positionY: { value: 0, min: -20, max: 20, step: 0.1 },
		positionZ: { value: 6, min: -20, max: 20, step: 0.1 },
	})

	// Post-processing controls
	const postProcessing = useControls('Post Processing', {
		'Tone Mapping': folder({
			toneMapping: { value: true, label: 'Enabled' },
			tmAdaptive: { value: true, label: 'Adaptive' },
			tmResolution: { value: 352, min: 64, max: 1024, step: 16 },
			tmMiddleGrey: { value: 0.1, min: 0, max: 1, step: 0.01 },
			tmMaxLuminance: { value: 20.0, min: 1, max: 100, step: 0.5 },
			tmAverageLuminance: { value: 0.3, min: 0, max: 1, step: 0.01 },
			tmAdaptationRate: { value: 0.6, min: 0, max: 2, step: 0.01 },
		}),
		'Hue Saturation': folder({
			hueSaturation: { value: true, label: 'Enabled' },
			hue: { value: -0.2, min: -Math.PI, max: Math.PI, step: 0.01 },
			saturation: { value: 0.22, min: -1, max: 1, step: 0.01 },
		}),
		Bloom: folder({
			bloom: { value: true, label: 'Enabled' },
			bloomIntensity: { value: 0.2, min: 0, max: 5, step: 0.01 },
			bloomKernelSize: {
				value: KernelSize.LARGE,
				options: {
					'Very Small': KernelSize.VERY_SMALL,
					Small: KernelSize.SMALL,
					Medium: KernelSize.MEDIUM,
					Large: KernelSize.LARGE,
					'Very Large': KernelSize.VERY_LARGE,
					Huge: KernelSize.HUGE,
				},
			},
			bloomLuminanceThreshold: { value: 0.9, min: 0, max: 1, step: 0.01 },
			bloomLuminanceSmoothing: { value: 0.025, min: 0, max: 1, step: 0.001 },
			bloomMipmapBlur: { value: false, label: 'Mipmap Blur' },
		}),
		'Brightness Contrast': folder({
			brightnessContrast: { value: true, label: 'Enabled' },
			brightness: { value: -1, min: -1, max: 1, step: 0.01 },
			contrast: { value: 1, min: -1, max: 1, step: 0.01 },
		}),
		SSAO: folder({
			ssao: { value: true, label: 'Enabled' },
			ssaoSamples: { value: 30, min: 1, max: 64, step: 1 },
			ssaoRings: { value: 4, min: 1, max: 16, step: 1 },
			ssaoDistanceThreshold: { value: 1.0, min: 0, max: 1, step: 0.01 },
			ssaoDistanceFalloff: { value: 0.0, min: 0, max: 1, step: 0.01 },
			ssaoRangeThreshold: { value: 0.5, min: 0, max: 1, step: 0.01 },
			ssaoRangeFalloff: { value: 0.1, min: 0, max: 1, step: 0.01 },
			ssaoLuminanceInfluence: { value: 0.9, min: 0, max: 1, step: 0.01 },
			ssaoRadius: { value: 20, min: 0.01, max: 100, step: 0.1 },
			ssaoScale: { value: 0.5, min: 0, max: 2, step: 0.01 },
			ssaoBias: { value: 0.5, min: -1, max: 1, step: 0.01 },
		}),
	})

	useEffect(() => {
		if (modelRef.current && onReady) {
			onReady(modelRef.current)
		}
	}, [onReady])

	const modelElement = (
		<group>
			<primitive
				ref={modelRef}
				object={scene}
				scale={modelControls.scale}
				position={[modelControls.positionX, modelControls.positionY, modelControls.positionZ]}
				rotation={[modelControls.rotationX, modelControls.rotationY, modelControls.rotationZ]}
			/>
		</group>
	)

	return (
		<>
			{floatControls.enabled ? (
				<Float
					speed={floatControls.speed}
					floatIntensity={floatControls.floatIntensity}
					rotationIntensity={floatControls.rotationIntensity}
				>
					{modelElement}
				</Float>
			) : (
				modelElement
			)}

			<Environment
				renderPriority={1}
				background={false}
				environmentIntensity={envControls.environmentIntensity}
				preset={envControls.preset}
			/>
			<GoboSpotlight />
			<EffectComposer renderPriority={1} enableNormalPass={true}>
				{postProcessing.toneMapping && (
					<ToneMapping
						blendFunction={BlendFunction.NORMAL}
						adaptive={postProcessing.tmAdaptive}
						resolution={postProcessing.tmResolution}
						middleGrey={postProcessing.tmMiddleGrey}
						maxLuminance={postProcessing.tmMaxLuminance}
						averageLuminance={postProcessing.tmAverageLuminance}
						adaptationRate={postProcessing.tmAdaptationRate}
					/>
				)}
				{postProcessing.hueSaturation && (
					<HueSaturation
						blendFunction={BlendFunction.NORMAL}
						hue={postProcessing.hue}
						saturation={postProcessing.saturation}
					/>
				)}
				{postProcessing.bloom && (
					<Bloom
						intensity={postProcessing.bloomIntensity}
						blurPass={undefined}
						kernelSize={postProcessing.bloomKernelSize}
						luminanceThreshold={postProcessing.bloomLuminanceThreshold}
						luminanceSmoothing={postProcessing.bloomLuminanceSmoothing}
						mipmapBlur={postProcessing.bloomMipmapBlur}
						resolutionX={Resolution.AUTO_SIZE}
						resolutionY={Resolution.AUTO_SIZE}
					/>
				)}
				{postProcessing.brightnessContrast && (
					<BrightnessContrast
						brightness={postProcessing.brightness}
						contrast={postProcessing.contrast}
					/>
				)}
				{postProcessing.ssao && (
					<SSAO
						blendFunction={BlendFunction.MULTIPLY}
						samples={postProcessing.ssaoSamples}
						rings={postProcessing.ssaoRings}
						distanceThreshold={postProcessing.ssaoDistanceThreshold}
						distanceFalloff={postProcessing.ssaoDistanceFalloff}
						rangeThreshold={postProcessing.ssaoRangeThreshold}
						rangeFalloff={postProcessing.ssaoRangeFalloff}
						luminanceInfluence={postProcessing.ssaoLuminanceInfluence}
						radius={postProcessing.ssaoRadius}
						scale={postProcessing.ssaoScale}
						bias={postProcessing.ssaoBias}
					/>
				)}
			</EffectComposer>
			<PerspectiveCamera
				makeDefault
				fov={cameraControls.fov}
				position={[cameraControls.positionX, cameraControls.positionY, cameraControls.positionZ]}
			/>
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
