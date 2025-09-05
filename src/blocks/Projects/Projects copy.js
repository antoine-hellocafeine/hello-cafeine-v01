'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import SplitText from 'gsap/SplitText'

import Copy from '@/animations/Copy'
import Image from '@/elements/Image'

import styles from './Projects.module.scss'

export default function Projects() {
	const containerRef = useRef(null)
	const textsRef = useRef(null)
	const textDefaultRef = useRef(null)
	const mediasRef = useRef(null)
	const mediaDefaultRef = useRef(null)
	const infosRef = useRef(null)
	const infosDefaultRef = useRef(null)
	const projectsWrapperRef = useRef(null)
	const [items, setItems] = useState(null)

	// Animation state refs
	const animationState = useRef({
		currentX: 0,
		targetX: 0,
		lerpFactor: 0.05,
		isAnimating: false,
	})

	// Project hover animation state - improved from first version
	const hoverState = useRef({
		currentIndex: -1, // -1 means default state (index 0)
		isAnimating: false,
		timeline: null,
	})

	useGSAP(() => {
		gsap.set(mediaDefaultRef.current, {
			width: window.innerWidth - (40 * window.innerWidth) / 1440,
			height: window.innerHeight - (40 * window.innerHeight) / 1440,
		})

		const tlScroll = gsap.timeline({
			scrollTrigger: {
				trigger: containerRef.current,
				start: 'top bottom',
				end: 'top 18%',
				scrub: 1,
			},
			onComplete: () => {
				gsap.to(textDefaultRef.current.querySelectorAll('.line'), {
					yPercent: 0,
					duration: 1,
					stagger: 0.1,
					ease: 'power4.out',
				})

				gsap.to(infosDefaultRef.current.querySelectorAll('.line'), {
					yPercent: 0,
					duration: 1,
					stagger: 0.1,
					ease: 'power4.out',
				})
			},
		})

		tlScroll
			.to(mediaDefaultRef.current, {
				width: '100%',
				height: '100%',
				ease: 'none',
			})
			.to(
				mediaDefaultRef.current.querySelector('img'),
				{
					scale: 1.2,
					ease: 'none',
				},
				'<',
			)

		// Setup project links with split text animation
		const projectsLinks = Array.from(projectsWrapperRef.current.children)
		projectsLinks.forEach((link) => {
			const span = link.querySelector('span')
			const split = new SplitText(span, { type: 'chars', charsClass: 'char' })
			const secondSpan = span.cloneNode(true)

			if (link.querySelector('a')) {
				const a = link.querySelector('a')
				a.appendChild(secondSpan)
			} else {
				link.appendChild(secondSpan)
			}

			gsap.set(secondSpan.querySelectorAll('.char'), {
				yPercent: 110,
			})
		})

		// Initialize all non-default media states
		const allMedias = Array.from(mediasRef.current.children)
		const allTexts = Array.from(textsRef.current.children)
		const allInfos = Array.from(infosRef.current.children)

		setItems(
			allMedias.map((_, i) => {
				const lines = {
					text: Array.from(allTexts[i].querySelectorAll('.line')),
					infos: Array.from(allInfos[i].querySelectorAll('.line')),
				}

				const media = {
					el: allMedias[i],
					img: allMedias[i].querySelector('img'),
				}

				const tlOpen = gsap.timeline({
					paused: true,
					defaults: {
						duration: 1,
						stagger: 0.1,
						ease: 'power4.out',
					},
				})

				tlOpen
					.to(lines.text, {
						yPercent: 0,
					})
					.to(
						lines.infos,
						{
							yPercent: 0,
						},
						0.4,
					)
					.to(
						media.el,
						{
							clipPath: 'inset(0% 0% 0% 0%)',
							ease: 'power3.inOut',
							duration: 0.6,
						},
						0,
					)
					.to(
						media.img,
						{
							scale: 1,
							ease: 'power3.out',
							duration: 0.6,
						},
						'<',
					)

				const tlClose = gsap.timeline({
					paused: true,
					onComplete: () => {
						gsap.set([...lines.text, ...lines.infos], {
							autoAlpha: 1,
							yPercent: 100,
						})
					},
				})

				tlClose.to([...lines.text, ...lines.infos], {
					autoAlpha: 0,
					duration: 0.4,
					ease: 'power4.out',
				})

				return {
					lines: lines,
					media: media,
					tlOpen: tlOpen,
					tlClose: tlClose,
				}
			}),
		)
	}, [])

	useGSAP(() => {
		if (!items) return

		// Set initial states for all project items (except default at index 0)
		items.forEach(({ media, lines }, i) => {
			if (i === 0) return // Skip default item

			gsap.set(media.el, {
				clipPath: 'inset(0% 0% 0% 100%)',
			})

			gsap.set(media.img, {
				scale: 2.4,
			})

			gsap.set(lines, {
				yPercent: 100,
			})
		})
	}, [items])

	// Smooth animation loop
	const animate = useCallback(() => {
		const { currentX, targetX, lerpFactor } = animationState.current

		// Linear interpolation for smooth movement
		const newCurrentX = currentX + (targetX - currentX) * lerpFactor
		animationState.current.currentX = newCurrentX

		// Apply the transform
		gsap.set(projectsWrapperRef.current, {
			x: newCurrentX,
		})

		// Continue the animation loop
		if (animationState.current.isAnimating) {
			requestAnimationFrame(animate)
		}
	}, [])

	// Start animation loop
	useEffect(() => {
		animationState.current.isAnimating = true
		animate()

		// Cleanup on unmount
		return () => {
			animationState.current.isAnimating = false
		}
	}, [animate])

	// // Improved project hover animation handler adapted from first version
	// const handleProjectHover = useCallback(
	// 	(index, enter) => {
	// 		if (window.innerWidth < 1000 || !items) return

	// 		// Kill any existing timeline to prevent conflicts
	// 		if (hoverState.current.timeline) {
	// 			hoverState.current.timeline.kill()
	// 		}

	// 		// Create new timeline
	// 		const tl = gsap.timeline({
	// 			defaults: {
	// 				duration: 1,
	// 				ease: 'power4.out',
	// 			},
	// 			onComplete: () => {
	// 				hoverState.current.isAnimating = false
	// 			},
	// 		})

	// 		hoverState.current.timeline = tl
	// 		hoverState.current.isAnimating = true

	// 		if (enter && index >= 0) {
	// 			// Store current index
	// 			hoverState.current.currentIndex = index

	// 			// Get elements - using 1-based indexing for projects
	// 			const targetItem = items[index + 1] // +1 because 0 is default
	// 			const defaultItem = items[0]

	// 			if (targetItem) {
	// 				// Prepare default media for exit animation
	// 				items.forEach((item, i) => {
	// 					gsap.set(item.media.el, {
	// 						zIndex: i === 0 ? 1 : 2,
	// 					})
	// 				})

	// 				gsap.set(targetItem.media.el, {
	// 					zIndex: 3,
	// 				})

	// 				// Hide default lines
	// 				tl.to(
	// 					defaultItem.lines,
	// 					{
	// 						yPercent: -100,
	// 						duration: 0.6,
	// 						stagger: 0.02,
	// 						ease: 'power3.inOut',
	// 					},
	// 					0,
	// 				)

	// 					// Show target lines
	// 					.to(
	// 						targetItem.lines,
	// 						{
	// 							yPercent: 0,
	// 							duration: 0.6,
	// 							stagger: 0.02,
	// 							ease: 'power3.inOut',
	// 						},
	// 						0.1,
	// 					)

	// 					// Reveal target media
	// 					.to(
	// 						targetItem.media.el,
	// 						{
	// 							clipPath: 'inset(0% 0% 0% 0%)',
	// 							duration: 1,
	// 							ease: 'power4.inOut',
	// 							onComplete: () => {
	// 								items.forEach((item) => {
	// 									gsap.set(item.media.el, {
	// 										zIndex: 1,
	// 									})
	// 								})

	// 								gsap.set(targetItem.media.el, { zIndex: 2 })

	// 								// Prepare default media for exit animation
	// 								gsap.set(defaultItem.media.el, {
	// 									clipPath: 'inset(0% 0% 0% 100%)',
	// 									zIndex: 3,
	// 								})

	// 								gsap.set(defaultItem.media.img, {
	// 									scale: 2.4,
	// 								})
	// 							},
	// 						},
	// 						0.2,
	// 					)
	// 					.to(
	// 						targetItem.media.img,
	// 						{
	// 							scale: 1,
	// 							duration: 1,
	// 							ease: 'power4.out',
	// 						},
	// 						0.2,
	// 					)
	// 			}
	// 		} else {
	// 			// Exit animation - return to default
	// 			const previousIndex = hoverState.current.currentIndex
	// 			hoverState.current.currentIndex = -1

	// 			if (previousIndex >= 0) {
	// 				const previousItem = items[previousIndex + 1]
	// 				const defaultItem = items[0]

	// 				if (previousItem) {
	// 					// Show default media with animation
	// 					tl.to(
	// 						defaultItem.media.el,
	// 						{
	// 							clipPath: 'inset(0% 0% 0% 0%)',
	// 							duration: 1,
	// 							ease: 'power4.inOut',
	// 							onComplete: () => {
	// 								// Reset previous media after default is shown
	// 								gsap.set(previousItem.media.el, {
	// 									clipPath: 'inset(0% 0% 0% 100%)',
	// 								})
	// 								gsap.set(previousItem.media.img, {
	// 									scale: 2.4,
	// 								})
	// 							},
	// 						},
	// 						0,
	// 					)
	// 						.to(
	// 							defaultItem.media.img,
	// 							{
	// 								scale: 1,
	// 								duration: 1,
	// 								ease: 'power4.out',
	// 							},
	// 							0,
	// 						)

	// 						// Hide previous project lines
	// 						.to(
	// 							previousItem.lines,
	// 							{
	// 								yPercent: 100,
	// 								duration: 0.6,
	// 								stagger: 0.02,
	// 								ease: 'power3.inOut',
	// 							},
	// 							0,
	// 						)

	// 						// Show default lines
	// 						.to(
	// 							defaultItem.lines,
	// 							{
	// 								yPercent: 0,
	// 								duration: 0.6,
	// 								stagger: 0.02,
	// 								ease: 'power3.inOut',
	// 							},
	// 							0.1,
	// 						)
	// 				}
	// 			}
	// 		}
	// 	},
	// 	[items],
	// )

	const handleMouseEvent = (el, enter) => {
		if (window.innerWidth < 1000) return

		const linkCopy = el.querySelectorAll('span')
		if (linkCopy.length < 2) return

		const visibleCopy = linkCopy[0]
		const animatedCopy = linkCopy[1]

		const visibleChars = visibleCopy.querySelectorAll('.char')
		gsap.to(visibleChars, {
			yPercent: enter ? -110 : 0,
			stagger: 0.03,
			duration: 0.5,
			ease: 'expo.inOut',
		})

		const animatedChars = animatedCopy.querySelectorAll('.char')
		gsap.to(animatedChars, {
			yPercent: enter ? 0 : 110,
			stagger: 0.03,
			duration: 0.5,
			ease: 'expo.inOut',
		})
	}

	const handleMouseMove = useCallback((e) => {
		if (window.innerWidth < 1000 || !projectsWrapperRef.current) return

		const mouseX = e.clientX
		const viewportWidth = window.innerWidth
		const projectsWrapperWidth = projectsWrapperRef.current.offsetWidth

		// Calculate movement boundaries
		const maxMoveLeft = 0
		const maxMoveRight = viewportWidth - projectsWrapperWidth

		// Only move if content is wider than viewport
		if (projectsWrapperWidth <= viewportWidth) {
			animationState.current.targetX = 0
			return
		}

		// Define sensitivity range (50% of viewport width)
		const sensitivityRange = viewportWidth * 0.5
		const startX = (viewportWidth - sensitivityRange) / 2
		const endX = startX + sensitivityRange

		let mousePercentage
		if (mouseX <= startX) {
			mousePercentage = 0
		} else if (mouseX >= endX) {
			mousePercentage = 1
		} else {
			mousePercentage = (mouseX - startX) / sensitivityRange
		}

		// Calculate target position
		animationState.current.targetX = maxMoveLeft + mousePercentage * (maxMoveRight - maxMoveLeft)
	}, [])

	const handleMouseEnter = useCallback(() => {
		// Optional: you can add additional effects when entering the projects section
	}, [])

	// const handleMouseLeave = useCallback(() => {
	// 	// Reset position when mouse leaves the section AND reset hover state
	// 	animationState.current.targetX = 0
	// 	handleProjectHover(-1, false) // Reset to default state
	// }, [handleProjectHover])

	const handleProjectHover = (i) => {
		items[i].tlOpen.play()
	}

	const handleProjectLeave = (i) => {
		items[i].tlClose.play()
	}

	return (
		<section
			ref={containerRef}
			id="projects"
			className={styles.projects}
			onMouseMove={handleMouseMove}
			onMouseEnter={handleMouseEnter}
			// onMouseLeave={handleMouseLeave}
		>
			<div className={styles.content}>
				<div ref={textsRef} className={styles.texts}>
					<div ref={textDefaultRef}>
						<Copy standby>
							<p>
								We're <strong>brewing stories</strong> through
								<br />
								digital living experiences.
							</p>
						</Copy>
					</div>
					<div>
						<Copy standby>
							<p>
								Salle de sport <strong>100% féminine</strong>, Syster's Gym avait besoins d'un site
								sur mesure pour accompagner la <strong>sérénité</strong> que la salle reflète.
							</p>
						</Copy>
					</div>
					<div>
						<Copy standby>
							<p>
								Boutique de pianos adaptée à tous les niveaux et tous les budgets, Bietry Musique
								vous propose de faire évoluer votre gamme avec ses{' '}
								<strong>offres de reprise</strong> et son
								<strong>catalogue enrichi</strong> au fur et à mesure que vous progressez.
							</p>
						</Copy>
					</div>
				</div>
				<div ref={mediasRef} className={styles.medias}>
					<div ref={mediaDefaultRef}>
						<Image src="/images/projects-default.webp" alt="projects-default" />
					</div>
					<div>
						<Image src="/images/project-sistersgym.webp" alt="project-sistersgym" />
					</div>
					<div>
						<Image src="/images/project-bietrymusique.webp" alt="project-bietrymusique" />
					</div>
				</div>
				<div ref={infosRef} className={styles.infos}>
					<div ref={infosDefaultRef}>
						<div>
							<Copy standby>
								<h3>Phone</h3>
							</Copy>
							<Copy standby>
								<a href="tel:+15551234567" target="_blank">
									+1 (555) 123-4567
								</a>
							</Copy>
						</div>
						<div>
							<Copy standby>
								<h3>E-mail</h3>
							</Copy>
							<Copy standby>
								<span>
									<strong>click to copy</strong>
								</span>
							</Copy>
						</div>
						<div>
							<Copy standby>
								<h3>Socials</h3>
							</Copy>
							<Copy standby>
								<a href="google.fr" target="_blank">
									Instagram
								</a>
							</Copy>
							<Copy standby>
								<a href="google.fr" target="_blank">
									Linkedin
								</a>
							</Copy>
						</div>
					</div>
					<div>
						<div>
							<Copy standby>
								<h3>Type</h3>
							</Copy>
							<Copy standby>
								<h2>showcase website</h2>
							</Copy>
						</div>
						<div>
							<Copy standby>
								<h3>Role</h3>
							</Copy>
							<Copy standby>
								<h2>
									<strong>art direction</strong>
								</h2>
							</Copy>
							<Copy standby>
								<h2>
									<strong>development</strong>
								</h2>
							</Copy>
							<Copy standby>
								<h2>
									<strong>digital strategy</strong>
								</h2>
							</Copy>
							<Copy standby>
								<h2>
									<strong>website</strong>
								</h2>
							</Copy>
							<Copy standby>
								<h2>
									<strong>3D</strong>
								</h2>
							</Copy>
							<Copy standby>
								<h2>
									<strong>logo</strong>
								</h2>
							</Copy>
						</div>
						<div>
							<Copy standby>
								<h3>Brewed in</h3>
							</Copy>
							<Copy standby>
								<h2>2025</h2>
							</Copy>
						</div>
					</div>
					<div>
						<div>
							<Copy standby>
								<h3>Type</h3>
							</Copy>
							<Copy standby>
								<h2>online catalog</h2>
							</Copy>
						</div>
						<div>
							<Copy standby>
								<h3>Role</h3>
							</Copy>
							<Copy standby>
								<h2>
									<strong>art direction</strong>
								</h2>
							</Copy>
							<Copy standby>
								<h2>
									<strong>development</strong>
								</h2>
							</Copy>
							<Copy standby>
								<h2>
									<strong>digital strategy</strong>
								</h2>
							</Copy>
							<Copy standby>
								<h2>
									<strong>website</strong>
								</h2>
							</Copy>
							<Copy standby>
								<h2>
									<strong>online inventory tool</strong>
								</h2>
							</Copy>
						</div>
						<div>
							<Copy standby>
								<h3>Brewed in</h3>
							</Copy>
							<Copy standby>
								<h2>2026</h2>
							</Copy>
						</div>
					</div>
				</div>
			</div>
			<div ref={projectsWrapperRef} className={styles.projectsWrapper}>
				<div className={styles.link}>
					<a
						href="google.fr"
						target="_blank"
						data-cursor-text="discover"
						onMouseEnter={(e) => {
							handleMouseEvent(e.currentTarget.parentElement, true)
							handleProjectHover(1)
						}}
						onMouseLeave={(e) => {
							handleMouseEvent(e.currentTarget.parentElement, false)
							handleProjectLeave(1)
						}}
					>
						<span>Sisters&apos;Gym,</span>
					</a>
				</div>
				<div className={styles.link}>
					<a
						href="google.fr"
						target="_blank"
						data-cursor-text="coming soon"
						onMouseEnter={(e) => {
							handleMouseEvent(e.currentTarget.parentElement, true)
							handleProjectHover(2)
						}}
						onMouseLeave={(e) => {
							handleMouseEvent(e.currentTarget.parentElement, false)
							handleProjectLeave(2)
						}}
					>
						<span>Bietry Musique,</span>
					</a>
				</div>
				<div
					className={styles.link}
					onMouseEnter={(e) => {
						handleMouseEvent(e.target, true)
					}}
					onMouseLeave={(e) => {
						handleMouseEvent(e.target, false)
					}}
				>
					<span>More</span>
				</div>
			</div>
			<div className={styles.background}>
				<video src="/background-white.webm" autoPlay loop muted />
			</div>
		</section>
	)
}
