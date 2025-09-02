'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

export default function GSAP() {
	gsap.registerPlugin(ScrollTrigger, useGSAP)

	return
}
