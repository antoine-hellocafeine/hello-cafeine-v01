'use client'

import { useEffect } from 'react'
import MouseFollower from 'mouse-follower'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export default function CursorWrapper() {
	useEffect(() => {
		MouseFollower.registerGSAP(gsap)

		const cursorInstance = new MouseFollower({
			hiddenState: '--hidden',
			textState: '--text',
			iconState: '--icon',
			activeState: '--active',
			mediaState: '--media',
			skewingIcon: 0,
			skewing: 0,
			skewingText: 0,
		})

		return () => {
			if (cursorInstance) {
				cursorInstance.destroy()
			}
		}
	}, [])

	useGSAP(() => {
		setTimeout(() => {
			const cursor = document.querySelector('.mf-cursor')

			if (cursor) {
				const tl = gsap.timeline({
					repeat: -1,
					yoyo: true,
					defaults: {
						ease: 'sine.inOut',
					},
				})

				tl.to(cursor, {
					scale: 1.2,
					duration: 3.2,
				}).to(cursor, {
					scale: 1,
					duration: 3.2,
				})
			}
		}, 400)
	}, [])

	return
}
