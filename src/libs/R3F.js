'use client'

import { Canvas } from '@react-three/fiber'
import { View, Preload } from '@react-three/drei'

export default function R3F() {
	return (
		<Canvas
			style={{
				position: 'fixed',
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				overflow: 'hidden',
				pointerEvents: 'none',
				zIndex: 200,
			}}
		>
			<View.Port />
			<Preload all />
		</Canvas>
	)
}
