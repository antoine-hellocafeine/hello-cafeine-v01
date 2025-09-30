'use client'

import { GlobalCanvas, SmoothScrollbar } from '@14islands/r3f-scroll-rig'
import { useRef, useEffect } from 'react'
import { Environment, SpotLight, useTexture, EffectComposer } from '@react-three/drei'
import { BlendFunction } from 'postprocessing'
import { HueSaturation, ToneMapping } from '@react-three/postprocessing'
import * as THREE from 'three'
import gsap from 'gsap'

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

export default function R3F({ children }) {
	return (
		<>
			<GlobalCanvas
				eventPrefix="client"
				style={{ pointerEvents: 'none' }}
				scaleMultiplier={0.01}
				globalClearDepth={false}
				camera={{ fov: 33 }}
				globalRender={false}
			>
				{(globalChildren) => (
					<>
						{globalChildren}
						<Environment
							renderPriority={1}
							background={false}
							environmentIntensity={0.1}
							preset="park"
						/>
						<GoboSpotlight />
						<EffectComposer renderPriority={1}>
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
						</EffectComposer>
					</>
				)}
			</GlobalCanvas>
			<SmoothScrollbar />
			{children}
		</>
	)
}
