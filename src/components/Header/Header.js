'use client'

import gsap from 'gsap'
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import Link from 'next/link'

import Copy from '@/animations/Copy'
import Logo from '@/elements/Logo'

import styles from './Header.module.scss'

export default function Header() {
	const logoRef = useRef(null)
	const contactRef = useRef(null)
	const headlineRef = useRef(null)

	useGSAP(() => {
		if (!logoRef.current) return

		gsap.from([logoRef.current, contactRef.current], {
			scale: 0.6,
			autoAlpha: 0,
			filter: 'blur(10px)',
			delay: 4.6,
			duration: 1,
			ease: 'power4.out',
			stagger: 0.8,
		})

		const tlContact = gsap.timeline({
			defaults: {
				ease: 'power4.out',
				duration: 1,
			},
			scrollTrigger: {
				trigger: '#projects',
				start: 'top 20%',
				toggleActions: 'play none none reverse',
			},
		})

		tlContact.to(contactRef.current, {
			scale: 0.6,
			autoAlpha: 0,
			filter: 'blur(10px)',
		})

		const tlLogoHeadline = gsap.timeline({
			defaults: {
				ease: 'power4.out',
				duration: 1,
			},
			scrollTrigger: {
				trigger: '#projects',
				start: 'top 15%',
				toggleActions: 'play none none reverse',
			},
		})

		const black = window
			.getComputedStyle(document.documentElement)
			.getPropertyValue('--color-black')

		tlLogoHeadline
			.to(logoRef.current.querySelectorAll('[fill]'), {
				fill: black,
			})
			.to(
				headlineRef.current,
				{
					color: black,
				},
				'<',
			)
	}, [logoRef])

	return (
		<header className={styles.header}>
			<div ref={logoRef} className={styles.logo}>
				<Logo />
			</div>
			<div ref={headlineRef} className={styles.headline}>
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
			<Link ref={contactRef} href="#projects" data-cursor="--hidden">
				<span>Contact</span>
			</Link>
		</header>
	)
}
