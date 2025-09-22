import { create } from 'zustand'

export const useStore = create((set) => ({
	isMobile: false,
	setIsMobile: (isMobile) => set({ isMobile }),
	projectsLoaded: false,
	setProjectsLoaded: (loaded) => set({ projectsLoaded: loaded }),
	preloaderDone: false,
	setPreloaderDone: (done) => set({ preloaderDone: done }),
}))
