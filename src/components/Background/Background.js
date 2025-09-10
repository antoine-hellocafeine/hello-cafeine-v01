'use client'

import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

import styles from './Background.module.scss'

export default function Background() {
	const videoContainerRef = useRef(null)

	let requestAnimationFrameId = null
	let xForce = 0
	let yForce = 0
	const easing = 0.08
	const speed = 0.01

	useLayoutEffect(() => {
		window.addEventListener('mousemove', manageMouseMove)

		return () => {
			window.removeEventListener('mousemove', manageMouseMove)
		}
	}, [])

	const manageMouseMove = (e) => {
		const { movementX, movementY } = e
		xForce += movementX * speed
		yForce += movementY * speed

		if (requestAnimationFrameId == null) {
			requestAnimationFrameId = requestAnimationFrame(animate)
		}
	}

	const lerp = (start, target, amount) => start * (1 - amount) + target * amount

	const animate = () => {
		xForce = lerp(xForce, 0, easing)
		yForce = lerp(yForce, 0, easing)
		gsap.set(videoContainerRef.current, {
			x: `+=${xForce * 0.2 * -1}`,
			y: `+=${yForce * 0.2 * -1}`,
		})

		if (Math.abs(xForce) < 0.01) xForce = 0
		if (Math.abs(yForce) < 0.01) yForce = 0

		if (xForce != 0 || yForce != 0) {
			requestAnimationFrame(animate)
		} else {
			cancelAnimationFrame(requestAnimationFrameId)
			requestAnimationFrameId = null
		}
	}

	return (
		<div ref={videoContainerRef} id="background" className={styles.background}>
			{/* <video src="/background.webm" autoPlay loop muted /> */}
		</div>
	)
}
