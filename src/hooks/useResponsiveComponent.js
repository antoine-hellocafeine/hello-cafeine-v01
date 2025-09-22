// hooks/useResponsiveComponent.js
import { useState, useEffect } from 'react'

export function useResponsiveComponent(desktopComponent, mobileComponent, breakpoint = 1024) {
	const [Component, setComponent] = useState(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const loadComponent = async () => {
			const isMobile = window.innerWidth < breakpoint

			try {
				const module = isMobile ? await mobileComponent() : await desktopComponent()

				setComponent(() => module.default || module)
			} catch (error) {
				// Fallback to desktop component
				const fallback = await desktopComponent()
				setComponent(() => fallback.default || fallback)
			} finally {
				setIsLoading(false)
			}
		}

		const handleResize = () => {
			loadComponent()
		}

		loadComponent()
		window.addEventListener('resize', handleResize)

		return () => window.removeEventListener('resize', handleResize)
	}, [desktopComponent, mobileComponent, breakpoint])

	return { Component, isLoading }
}
