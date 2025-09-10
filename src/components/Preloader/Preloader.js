'use client'

import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import React, { useRef, useLayoutEffect } from 'react'
import CountUp from 'react-countup'

import SVG from '@/elements/SVG'

import styles from './Preloader.module.scss'

export default function Preloader() {
	const refs = {
		container: useRef(null),
		shapes: useRef([]),
		progress: useRef(null),
		numbers: useRef(null),
		reveal: useRef(null),
	}
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

	useGSAP(() => {
		gsap.set(refs.progress.current, {
			scaleX: 0,
			transformOrigin: 'left',
		})

		gsap.set(refs.reveal.current, {
			clipPath: 'polygon(25% 75%, 75% 75%, 75% 75%, 25% 75%)',
		})
	}, [])

	useGSAP(() => {
		const shapes = refs.shapes.current
		const progress = refs.progress.current
		const numbers = refs.numbers.current

		const tlHide = gsap.timeline({
			paused: true,
			defaults: {
				ease: 'power3.in',
				duration: 0.8,
			},
			onComplete: () => {
				document
					.querySelector('#background')
					.appendChild(refs.reveal.current.querySelector('video'))
				refs.container.current.remove()
			},
		})

		tlHide
			.to(shapes, {
				x: -50,
				autoAlpha: 0,
			})
			.to(
				progress,
				{
					y: 50,
					autoAlpha: 0,
				},
				'<',
			)
			.to(
				numbers,
				{
					y: 50,
					autoAlpha: 0,
				},
				'<',
			)
			.to(
				refs.reveal.current,
				{
					clipPath: 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)',
					duration: 1.6,
					ease: 'hop',
				},
				0,
			)

		const tl = gsap.timeline({
			onComplete: () => {
				tlHide.play()
			},
		})

		const revealDelays = [0.6, 0.6, 0.1, 0.2, 0.4, 0.4]

		tl.to(progress, {
			scaleX: 1,
			duration: 3,
			ease: 'expo.inOut',
		})

		shapes.querySelectorAll('li').forEach((shape, i) => {
			tl.from(
				shape,
				{
					x: -40,
					autoAlpha: 0,
					duration: 0.6,
					ease: 'expo.out',
					delay: revealDelays[i],
				},
				'<',
			)
		})
	}, [])

	return (
		<div ref={refs.container} className={styles.container}>
			<ul ref={refs.shapes}>
				{Array.from({ length: 6 }).map((_, i) => (
					<li key={i}>
						<SVG name={`shape-${i + 1}`} />
					</li>
				))}
			</ul>
			<div ref={refs.progress} className={styles.progress} />
			<div ref={refs.numbers} className={styles.numbers}>
				<CountUp
					start={0}
					end={100}
					duration={3}
					easingFn={(t, b, c, d) => {
						if (t === 0) return b
						if (t === d) return b + c
						if ((t /= d / 2) < 1) return (c / 2) * Math.pow(2, 10 * (t - 1)) + b
						return (c / 2) * (-Math.pow(2, -10 * --t) + 2) + b
					}}
				/>
			</div>
			<div ref={videoContainerRef} className={styles.background}>
				<video src="/background-white.webm" autoPlay loop muted />
			</div>
			<div ref={refs.reveal} className={styles.reveal}>
				<video src="/background.webm" autoPlay loop muted />
			</div>
		</div>
	)
}
