import NextImage from 'next/image'

export default function Image(props) {
	return <NextImage fill sizes="(max-width: 1024px) 100vw, 33vw" quality={100} {...props} />
}
