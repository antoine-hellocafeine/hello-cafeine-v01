'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'
import { useGSAP } from '@gsap/react'

export default function GSAP() {
	gsap.registerPlugin(ScrollTrigger, useGSAP, SplitText, Flip, CustomEase)

	CustomEase.create('preloader', '0.9, 0, 0.1, 1')
	CustomEase.create('hop', '0.9, 0, 0.1, 1')
	CustomEase.create('slider', '.87,0,.13,1')

	return
}
