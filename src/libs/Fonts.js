import localFont from 'next/font/local'

export const hc = localFont({
	src: '../fonts/HelloCafeine.otf',
	variable: '--font-hc',
	display: 'swap',
	preload: true,
	fallback: ['system-ui', 'arial'],
})

export const helvetica = localFont({
	src: [
		{
			path: '../fonts/HelveticaNeueUltraLight.otf',
			weight: '100',
			style: 'normal',
		},
		{
			path: '../fonts/HelveticaNeueThin.otf',
			weight: '200',
			style: 'normal',
		},
		{
			path: '../fonts/HelveticaNeueLight.otf',
			weight: '300',
			style: 'normal',
		},
		{
			path: '../fonts/HelveticaNeueRoman.otf',
			weight: '400',
			style: 'normal',
		},
		{
			path: '../fonts/HelveticaNeueMedium.otf',
			weight: '500',
			style: 'normal',
		},
		{
			path: '../fonts/HelveticaNeueBold.otf',
			weight: '700',
			style: 'normal',
		},
		{
			path: '../fonts/HelveticaNeueHeavy.otf',
			weight: '800',
			style: 'normal',
		},
		{
			path: '../fonts/HelveticaNeueBlack.otf',
			weight: '900',
			style: 'normal',
		},
	],
	variable: '--font-helvetica',
	display: 'swap',
	preload: true,
	fallback: ['system-ui', 'arial'],
})

const fontsClasses = `${helvetica.variable} ${hc.variable}`
export default fontsClasses
