'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import Star from '@/components/Star'
import styles from './Hero.module.scss'

export default function Hero() {
	const containerRef = useRef(null)
	const viewRef = useRef(null)

	useGSAP(() => {
		if (!viewRef.current) return

		ScrollTrigger.create({
			trigger: containerRef.current,
			start: 'top top',
			end: 'bottom bottom',
			pin: viewRef.current,
		})
	}, [viewRef])

	const handleModelReady = (model) => {
		// Initial animation
		gsap.to(model.position, {
			y: 0,
			duration: 1.2,
			delay: 0.5,
			ease: 'power3.out',
		})

		gsap.to(model.rotation, {
			y: Math.PI,
			duration: 1.2,
			delay: 0.5,
			ease: 'expo.inOut',
			onComplete: () => {
				// Scroll-based animations
				const scrollTrigger = {
					trigger: containerRef.current,
					start: 'top top',
					end: 'bottom top',
					scrub: true,
				}

				gsap.to(model.rotation, {
					y: 0,
					scrollTrigger,
					ease: 'power3.out',
				})

				gsap.to(model.position, {
					x: -1,
					scrollTrigger,
					ease: 'power3.out',
				})

				gsap.to(model.scale, {
					x: 0.96,
					y: 0.96,
					z: 0.96,
					scrollTrigger,
					ease: 'power3.out',
				})
			},
		})
	}

	return (
		<section ref={containerRef} className={styles.hero}>
			<Star viewRef={viewRef} onModelReady={handleModelReady} />
			<div className={styles.background}>
				<video src="/background.webm" autoPlay loop muted />
			</div>
		</section>
	)
}
