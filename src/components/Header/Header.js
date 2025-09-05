import Copy from '@/animations/Copy'

import styles from './Header.module.scss'

export default function Header() {
	return (
		<header className={styles.header}>
			<div className={styles.headline}>
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
		</header>
	)
}
