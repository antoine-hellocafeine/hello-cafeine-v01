'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useRef } from 'react'

import styles from './ScrollProgress.module.scss'

export default function ScrollProgress() {
	const scrollProgressRef = useRef(null)
	const textsRef = useRef(null)
	const progressFillRef = useRef(null)
	const number1Ref = useRef(null)
	const number2Ref = useRef(null)
	const number3Ref = useRef(null)
	const currentTextIndex = useRef(-1) // Start with -1 to force initial animation

	useGSAP(() => {
		if (
			!textsRef.current ||
			!progressFillRef.current ||
			!number1Ref.current ||
			!number2Ref.current ||
			!number3Ref.current
		)
			return

		gsap.from(scrollProgressRef.current, {
			y: 50,
			autoAlpha: 0,
			duration: 0.6,
			ease: 'power3.in',
			delay: 4.8,
		})

		// Set initial positions for all text elements
		gsap.set([textsRef.current.children[1], textsRef.current.children[2]], {
			position: 'absolute',
			yPercent: 100,
			right: 0,
			bottom: 0,
		})

		// Initialize all number spans except first ones to be hidden
		Array.from(number1Ref.current.children)
			.slice(1)
			.forEach((span) => {
				gsap.set(span, { autoAlpha: 0 })
			})
		Array.from(number2Ref.current.children)
			.slice(1)
			.forEach((span) => {
				gsap.set(span, { autoAlpha: 0 })
			})
		Array.from(number3Ref.current.children)
			.slice(1)
			.forEach((span) => {
				gsap.set(span, { autoAlpha: 0 })
			})

		let currentDigits = [0, 0, 0] // [hundreds, tens, units]
		let maxDigitsSeen = [0, 0, 0] // Track highest digit seen in each position
		let isAnimating = false // Prevent overlapping animations

		// Helper function to determine which text should show based on percentage
		const getTargetTextIndex = (percentage) => {
			if (percentage <= 10) return 0 // "Learn more about us"
			if (percentage <= 95) return 1 // "Scroll a little more"
			return 2 // "You're in"
		}

		// Helper function to animate text transition
		const transitionToText = (newIndex, oldIndex) => {
			if (isAnimating || newIndex === oldIndex || oldIndex === -1) {
				// Skip if already animating, same index, or initial setup
				if (oldIndex === -1) currentTextIndex.current = newIndex
				return
			}

			isAnimating = true
			currentTextIndex.current = newIndex

			const newText = textsRef.current.children[newIndex]
			const oldText = textsRef.current.children[oldIndex]

			// Determine animation direction based on index change
			const goingForward = newIndex > oldIndex

			// Set initial position for new text
			gsap.set(newText, {
				yPercent: goingForward ? 100 : -100,
			})

			// Animate old text out
			gsap.to(oldText, {
				yPercent: goingForward ? -100 : 100,
				ease: 'power4.out',
				duration: 0.8,
				onComplete: () => {
					isAnimating = false
				},
			})

			// Animate new text in
			gsap.to(newText, {
				yPercent: 0,
				ease: 'power4.out',
				duration: 0.8,
				delay: 0.2,
			})
		}

		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: document.body,
				start: 'top top',
				end: 'bottom bottom',
				scrub: true,
				onUpdate: (self) => {
					const percentage = Math.round(self.progress * 100)

					// Handle text transitions based purely on percentage
					const targetTextIndex = getTargetTextIndex(percentage)
					if (targetTextIndex !== currentTextIndex.current) {
						transitionToText(targetTextIndex, currentTextIndex.current)
					}

					// Handle number updates (keeping your existing logic)
					const hundreds = Math.floor(percentage / 100)
					const tens = Math.floor((percentage % 100) / 10)
					const units = percentage % 10

					const newDigits = [hundreds, tens, units]
					const refs = [number1Ref, number2Ref, number3Ref]

					// Update each digit position
					newDigits.forEach((digit, position) => {
						if (digit !== currentDigits[position]) {
							// Hide current digit
							gsap.set(refs[position].current.children[currentDigits[position]], {
								autoAlpha: 0,
							})

							// Show new digit
							gsap.set(refs[position].current.children[digit], {
								autoAlpha: 1,
							})

							// Update max digit seen for this position
							if (digit > maxDigitsSeen[position]) {
								maxDigitsSeen[position] = digit
							}

							currentDigits[position] = digit
						}

						// Handle coloring for zeros
						if (digit === 0) {
							const color = maxDigitsSeen[position] > 0 ? '#ec4613' : '#e2ded6'
							gsap.set(refs[position].current.children[0], { color })
						}
					})
				},
			},
		})

		// Animate progress bar fill
		tl.to(progressFillRef.current, {
			scaleX: 1,
			ease: 'none',
		})

		if (window.innerWidth > 1024) {
			const projectsContainer = document.querySelector('#projects')

			ScrollTrigger.create({
				trigger: projectsContainer,
				start: () => {
					return `top ${
						100 -
						(100 *
							((30 * window.innerWidth) / 1440 +
								((scrollProgressRef.current.offsetHeight / 4) * window.innerWidth) / 1440)) /
							window.innerHeight
					}%`
				},
				toggleClass: {
					targets: scrollProgressRef.current,
					className: styles['--dark'],
				},
			})
			ScrollTrigger.create({
				trigger: projectsContainer,
				start: () => {
					return `top ${
						100 -
						(100 *
							((60 * window.innerWidth) / 1440 +
								(30 * window.innerWidth) / 1440 +
								(scrollProgressRef.current.offsetHeight * window.innerWidth) / 1440)) /
							window.innerHeight
					}%`
				},
				onEnter: () => {
					projectsContainer.appendChild(scrollProgressRef.current)
				},
				onLeaveBack: () => {
					document.body.appendChild(scrollProgressRef.current)
				},
			})
		}
	}, [textsRef, progressFillRef, number1Ref, number2Ref, number3Ref])

	return (
		<div ref={scrollProgressRef} id="scrollProgress" className={styles.scrollProgress}>
			<div ref={textsRef} className={styles.text}>
				<span>Learn more about us</span>
				<span>Scroll a little more</span>
				<span>You&apos;re in</span>
			</div>
			<div className={styles.progress}>
				<div ref={progressFillRef} className={styles.fill} />
				<div className={styles.background} />
			</div>
			<div className={styles.numbers}>
				<div ref={number1Ref} className={styles.number}>
					<span>0</span>
					<span>1</span>
				</div>
				<div ref={number2Ref} className={styles.number}>
					<span>0</span>
					<span>1</span>
					<span>2</span>
					<span>3</span>
					<span>4</span>
					<span>5</span>
					<span>6</span>
					<span>7</span>
					<span>8</span>
					<span>9</span>
				</div>
				<div ref={number3Ref} className={styles.number}>
					<span>0</span>
					<span>1</span>
					<span>2</span>
					<span>3</span>
					<span>4</span>
					<span>5</span>
					<span>6</span>
					<span>7</span>
					<span>8</span>
					<span>9</span>
				</div>
				<span>/100</span>
			</div>
		</div>
	)
}
