'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import Star from '@/components/Star'
import Copy from '@/animations/Copy'

import styles from './Hero.module.scss'

export default function Hero() {
	const containerRef = useRef(null)
	const viewRef = useRef(null)
	const titleRef = useRef(null)
	const textRef = useRef(null)
	const textTimelineRef = useRef(null)
	const textAnimatedRef = useRef(false)
	const maskRef = useRef(null)

	useGSAP(() => {
		if (!viewRef.current) return

		gsap.set(textRef.current, {
			filter: 'blur(0px)',
		})

		ScrollTrigger.create({
			trigger: containerRef.current,
			start: 'top top',
			end: 'bottom bottom',
			pin: viewRef.current,
		})

		const textTimeline = gsap.timeline({
			paused: true,
			defaults: {
				duration: 0.8,
				stagger: 0.08,
				ease: 'power4.out',
			},
			onStart: () => {
				gsap.set(textRef.current, {
					filter: 'blur(0px)',
					scale: 1,
					autoAlpha: 1,
				})

				gsap.set(textRef.current.querySelectorAll('.line'), {
					yPercent: 100,
				})
			},
		})

		textTimeline.to(textRef.current.querySelectorAll('.line'), {
			yPercent: 0,
		})

		textTimelineRef.current = textTimeline

		ScrollTrigger.create({
			trigger: containerRef.current,
			start: 'top top',
			end: 'bottom bottom',
			pin: textRef.current,
			anticipatePin: 1,
			pinType: 'fixed',
			onUpdate: ({ progress, direction }) => {
				if (progress > 0.5 && direction === 1 && !textAnimatedRef.current) {
					textAnimatedRef.current = true
					textTimelineRef.current.restart()
				}

				if (progress < 0.5 && direction === -1 && textAnimatedRef.current) {
					textAnimatedRef.current = false
					gsap.to(textRef.current, {
						autoAlpha: 0,
						scale: 0.9,
						filter: 'blur(4px)',
						duration: 0.6,
						ease: 'power3.out',
					})
				}
			},
		})

		const tlTitle = gsap.timeline({
			scrollTrigger: {
				trigger: containerRef.current,
				start: 'top top',
				end: '+=100%',
				scrub: true,
			},
		})

		const spans = Array.from(titleRef.current.querySelectorAll('span'))

		gsap.set(spans, {
			filter: 'blur(0px)',
			transformOrigin: 'top left',
		})

		spans.forEach((span, i) => {
			tlTitle.to(
				span,
				{
					yPercent: -20 * (spans.length - i),
					autoAlpha: 0,
					filter: 'blur(10px)',
					scale: 0.84,
					ease: 'none',
					delay: i * 0.1,
				},
				'<',
			)
		})

		const tlEnd = gsap.timeline({
			scrollTrigger: {
				trigger: containerRef.current,
				start: 'bottom bottom',
				end: 'bottom top',
				scrub: true,
			},
		})

		gsap.set(containerRef.current.querySelector('canvas'), {
			filter: 'blur(0px)',
		})

		tlEnd
			.to(containerRef.current.querySelector('canvas'), {
				yPercent: -20,
				scale: 0.9,
				filter: 'blur(6px)',
			})
			.to(
				textRef.current,
				{
					yPercent: 100,
					autoAlpha: 0,
					ease: 'none',
				},
				'<',
			)
	}, [viewRef])

	useGSAP(() => {
		const tlMask = gsap.timeline({
			scrollTrigger: {
				trigger: containerRef.current,
				start: 'bottom bottom', // when hero bottom hits viewport bottom
				end: 'bottom top', // until hero completely leaves viewport
				scrub: true,
			},
		})

		tlMask.fromTo(
			maskRef.current,
			{
				clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)', // start
			},
			{
				clipPath: 'polygon(0% 80%, 100% 50%, 100% 100%, 0% 100%)', // end
				ease: 'none',
			},
		)
	}, [])

	const handleModelReady = (model) => {
		// Initial animation
		gsap.to(model.position, {
			y: 0.1,
			duration: 1.2,
			delay: 4.4,
			ease: 'power3.out',
		})

		gsap.to(model.rotation, {
			y: Math.PI,
			duration: 1.2,
			delay: 4.4,
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
					x: -1.4,
					y: -0.1,
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
			<div ref={maskRef} className={styles.maskBackground}>
				<div>
					<video src="/background-white.webm" autoPlay loop muted />
				</div>
			</div>
			<Copy ref={titleRef} className={styles.title} delay={4.2} animateOnScroll={false}>
				<span>Brewing</span>
				<span>Digital</span>
				<span>Experiences</span>
			</Copy>
			<div className={styles.headline}>
				<Copy animateOnScroll={false} delay={4.8}>
					<span>Smart design</span>
				</Copy>
				<Copy animateOnScroll={false} delay={4.9}>
					<span>
						<svg
							width="15"
							height="14"
							viewBox="0 0 15 14"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M13.8645 5.56983L12.2851 7.45492L12.8334 7.99517L9.18631 7.93814L9.25696 12.9976L8.78776 12.6003L5.87138 13.0669L5.82921 7.91014V7.89977L1.56641 7.83444L1.81629 5.45462L5.80918 5.48169L5.77861 1.85535L8.40397 0.933594H9.08825L9.15152 5.50035L13.8645 5.5324H13.9331L13.8645 5.56983Z"
								fill="#EC4613"
							/>
						</svg>
					</span>
				</Copy>
				<Copy animateOnScroll={false} delay={5}>
					<span>Sharp development</span>
				</Copy>
				<Copy animateOnScroll={false} delay={5.1}>
					<span>
						<svg
							width="15"
							height="14"
							viewBox="0 0 15 14"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M3.75 13.2992V0.699219L10.75 5.88745L3.75 13.2992Z" fill="#EC4613" />
						</svg>
					</span>
				</Copy>
				<Copy animateOnScroll={false} delay={5.2}>
					<span>Communication amplified</span>
				</Copy>
			</div>
			<Copy ref={textRef} className={styles.text} standby>
				<p>
					<strong>What are we doing ?</strong>
					<br />
					We craft digital experiences that amplify your message, combining bespoke design and
					development to elevate your communication strategy.
				</p>
			</Copy>
			<Star viewRef={viewRef} onModelReady={handleModelReady} />
		</section>
	)
}
