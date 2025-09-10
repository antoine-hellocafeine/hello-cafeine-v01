'use client'

import { useRef, useCallback, useEffect, useState, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import SplitText from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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
	const firstEnterRef = useRef(true)
	const videoRef = useRef(null)
	const videoContainerRef = useRef(null)
	const canvasRef = useRef(null)
	const canvasContainerRef = useRef(null)
	const [context, setContext] = useState(null)
	const frameCount = 122

	// Canvas animation state
	const [images, setImages] = useState([])
	const [imagesLoaded, setImagesLoaded] = useState(false)
	const videoFrames = useRef({ frame: 0 })

	let requestAnimationFrameId = null
	let xForce = 0
	let yForce = 0
	const easing = 0.08
	const speed = 0.01

	const setCanvasSize = useCallback(() => {
		if (!canvasRef.current || !context || !canvasContainerRef.current) return

		const canvas = canvasRef.current
		const container = canvasContainerRef.current
		const rect = container.getBoundingClientRect()

		// Use the container's actual rendered size
		const canvasWidth = rect.width
		const canvasHeight = rect.height

		const pixelRatio = window.devicePixelRatio || 1

		canvas.width = canvasWidth * pixelRatio
		canvas.height = canvasHeight * pixelRatio
		canvas.style.width = canvasWidth + 'px'
		canvas.style.height = canvasHeight + 'px'

		context.scale(pixelRatio, pixelRatio)
	}, [context])

	const currentFrame = (index) =>
		`/images/frames/frame_${(index + 1).toString().padStart(4, '0')}.webp`

	// Render canvas frame
	const render = useCallback(() => {
		if (!context || !canvasRef.current || !imagesLoaded || !canvasContainerRef.current) return

		const container = canvasContainerRef.current
		const rect = container.getBoundingClientRect()
		const canvasWidth = rect.width
		const canvasHeight = rect.height

		context.clearRect(0, 0, canvasWidth, canvasHeight)

		const img = images[videoFrames.current.frame]
		if (img && img.complete && img.naturalWidth > 0) {
			const imageAspect = img.naturalWidth / img.naturalHeight
			const canvasAspect = canvasWidth / canvasHeight

			let drawWidth, drawHeight, drawX, drawY

			if (imageAspect > canvasAspect) {
				drawHeight = canvasHeight
				drawWidth = drawHeight * imageAspect
				drawX = (canvasWidth - drawWidth) / 2
				drawY = 0
			} else {
				drawWidth = canvasWidth
				drawHeight = drawWidth / imageAspect
				drawX = 0
				drawY = (canvasHeight - drawHeight) / 2
			}

			context.drawImage(img, drawX, drawY, drawWidth, drawHeight)
		}
	}, [context, images, imagesLoaded])

	// Load frame images
	useEffect(() => {
		if (!context) return

		const loadedImages = []
		let imagesToLoad = frameCount

		const onLoad = () => {
			imagesToLoad--
			if (imagesToLoad === 0) {
				setImages(loadedImages)
				setImagesLoaded(true)
			}
		}

		const onError = () => {
			imagesToLoad--
			if (imagesToLoad === 0) {
				setImages(loadedImages)
				setImagesLoaded(true)
			}
		}

		for (let i = 0; i < frameCount; i++) {
			const img = document.createElement('img')
			img.addEventListener('load', onLoad)
			img.addEventListener('error', onError)
			img.src = currentFrame(i)
			loadedImages.push(img)
		}

		return () => {
			loadedImages.forEach((img) => {
				img.removeEventListener('load', onLoad)
				img.removeEventListener('error', onError)
			})
		}
	}, [context, frameCount])

	// Initial render when images are loaded
	useEffect(() => {
		if (imagesLoaded) {
			setCanvasSize()
			render()
		}
	}, [imagesLoaded, render, setCanvasSize])

	useLayoutEffect(() => {
		window.addEventListener('mousemove', manageMouseMove)
		window.addEventListener('resize', handleResize)

		const canvas = canvasRef.current
		if (canvas) {
			setContext(canvas.getContext('2d'))
		}

		return () => {
			window.removeEventListener('mousemove', manageMouseMove)
			window.removeEventListener('resize', handleResize)
		}
	}, [])

	// Handle canvas resize
	const handleResize = useCallback(() => {
		if (context) {
			setCanvasSize()
			render()
		}
	}, [context, setCanvasSize, render])

	// Set canvas size when context is available
	useEffect(() => {
		if (context) {
			setCanvasSize()
		}
	}, [context, setCanvasSize])

	const manageMouseMove = (e) => {
		const { movementX, movementY } = e
		xForce += movementX * speed
		yForce += movementY * speed

		if (requestAnimationFrameId == null) {
			requestAnimationFrameId = requestAnimationFrame(animateBg)
		}
	}

	const lerp = (start, target, amount) => start * (1 - amount) + target * amount

	const animateBg = () => {
		xForce = lerp(xForce, 0, easing)
		yForce = lerp(yForce, 0, easing)
		gsap.set(videoContainerRef.current, {
			x: `+=${xForce * 0.2 * -1}`,
			y: `+=${yForce * 0.2 * -1}`,
		})

		if (Math.abs(xForce) < 0.01) xForce = 0
		if (Math.abs(yForce) < 0.01) yForce = 0

		if (xForce != 0 || yForce != 0) {
			requestAnimationFrame(animateBg)
		} else {
			cancelAnimationFrame(requestAnimationFrameId)
			requestAnimationFrameId = null
		}
	}

	// Animation state refs
	const animationState = useRef({
		currentX: 0,
		targetX: 0,
		lerpFactor: 0.05,
		isAnimating: false,
	})

	useGSAP(() => {
		gsap.set(mediaDefaultRef.current, {
			width: window.innerWidth - (40 * window.innerWidth) / 1440,
			height: window.innerHeight - (40 * window.innerHeight) / 1440,
		})

		const tlScroll = gsap.timeline({
			scrollTrigger: {
				trigger: containerRef.current,
				start: 'top 95%',
				end: 'top top',
				scrub: true,
				onUpdate: (self) => {
					if (self.progress >= 0.7 && !self.hasTriggered) {
						self.hasTriggered = true

						gsap.to(textDefaultRef.current.querySelectorAll('.line'), {
							yPercent: 0,
							duration: 0.8,
							stagger: 0.08,
							ease: 'power4.out',
						})

						gsap.to(infosDefaultRef.current.querySelectorAll('.line'), {
							yPercent: 0,
							duration: 0.8,
							stagger: 0.08,
							ease: 'power4.out',
						})
					}
				},
			},
		})

		tlScroll
			.to(mediaDefaultRef.current, {
				width: '100%',
				height: '100%',
				ease: 'none',
			})
			.to(
				canvasContainerRef.current,
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
					img: allMedias[i].querySelector(`.${styles.container}`),
				}

				const tlOpen = gsap.timeline({
					paused: true,
					defaults: {
						duration: 0.8,
						stagger: 0.04,
						ease: 'power4.out',
						overwrite: 'auto',
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
							ease: 'slider',
							duration: 0.6,
						},
						0,
					)
					.to(
						media.img,
						{
							left: '-20%',
							ease: 'slider',
							duration: 0.6,
						},
						'<',
					)

				const tlClose = gsap.timeline({
					defaults: {
						overwrite: 'auto',
						autoAlpha: 0,
						duration: 0.4,
						ease: 'power4.out',
					},
					paused: true,
					onComplete: () => {
						gsap.set([...lines.text, ...lines.infos], {
							autoAlpha: 1,
							yPercent: 100,
						})

						gsap.set(media.el, {
							zIndex: 1,
						})
					},
				})

				tlClose
					.to(lines.text, {
						autoAlpha: 0,
					})
					.to(lines.infos, {
						delay: 0.08,
						autoAlpha: 0,
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

	// Canvas scroll animation
	useGSAP(() => {
		if (!imagesLoaded || !containerRef.current) return

		ScrollTrigger.create({
			trigger: containerRef.current,
			start: 'top bottom',
			end: 'bottom bottom',
			scrub: 1,
			onUpdate: (self) => {
				const progress = self.progress
				const targetFrame = Math.round(progress * (frameCount - 1))
				videoFrames.current.frame = Math.max(0, Math.min(targetFrame, frameCount - 1))
				render()
			},
		})
	}, [imagesLoaded, render])

	useGSAP(() => {
		if (!items) return

		// Set initial states for all project items (except default at index 0)
		items.forEach(({ media, lines }, i) => {
			if (i === 0) return // Skip default item

			gsap.set(media.el, {
				clipPath: 'inset(0% 0% 0% 100%)',
			})

			gsap.set(media.img, {
				left: '0%',
			})

			gsap.set([...lines.text, ...lines.infos], {
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

	const handleProjectHover = (i) => {
		items.forEach((item, j) => {
			gsap.set(item.media.el, {
				zIndex:
					j === 0 ? (firstEnterRef.current ? 2 : 1) : i === j ? 3 : firstEnterRef.current ? 1 : 2,
			})
		})

		if (firstEnterRef.current) {
			items[0].tlClose.progress(0).play()
			firstEnterRef.current = false
		}

		items[i].tlOpen.progress(0).play()
	}

	const handleProjectLeave = (i) => {
		items[i].tlOpen.pause()
		items[i].tlClose.progress(0).play()
	}

	return (
		<section
			ref={containerRef}
			id="projects"
			className={styles.projects}
			onMouseMove={handleMouseMove}
			onMouseEnter={handleMouseEnter}
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
						<div className={styles.container}>
							<div ref={canvasContainerRef} className={styles.canvasContainer}>
								<canvas ref={canvasRef} />
							</div>
						</div>
					</div>
					<div>
						<div className={styles.container}>
							<Image src="/images/project-sistersgym.webp" alt="project-sistersgym" />
						</div>
					</div>
					<div>
						<div className={styles.container}>
							<Image src="/images/project-bietrymusique.webp" alt="project-bietrymusique" />
						</div>
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
			<div
				ref={projectsWrapperRef}
				className={styles.projectsWrapper}
				onMouseLeave={() => {
					if (!firstEnterRef.current) {
						gsap.set([...items[0].lines.text, ...items[0].lines.infos], {
							ypercent: 100,
						})

						gsap.set(items[0].media.el, {
							zIndex: 4,
							clipPath: 'inset(0% 0% 0% 100%)',
						})

						gsap.set(items[0].media.img, {
							left: '0%',
						})

						items[0].tlOpen.progress(0).play()
						firstEnterRef.current = true
					}
				}}
			>
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
			<div ref={videoContainerRef} className={styles.background}>
				<video src="/background-white.webm" autoPlay loop muted />
			</div>
		</section>
	)
}
