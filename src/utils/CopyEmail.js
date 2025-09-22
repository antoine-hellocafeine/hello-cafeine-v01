/**
 * Modern clipboard copy function using the Clipboard API
 * @param {string} text - Text to copy to clipboard
 * @returns {Promise<void>} - Promise that resolves when copying succeeds or rejects on failure
 */
export const copyToClipboard = async (text) => {
	try {
		// Check if running in browser environment
		if (typeof navigator === 'undefined' || !navigator.clipboard) {
			throw new Error('Clipboard API not available in this environment')
		}

		// Use the Clipboard API
		await navigator.clipboard.writeText(text)
		return true
	} catch (error) {
		console.error('Failed to copy text:', error)
		throw error
	}
}

/**
 * Enhanced clipboard copy function with feedback handling
 * Uses modern ES6 features and best practices
 *
 * @param {string} text - Text to copy to the clipboard
 * @param {Object} options - Configuration options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {boolean} options.showFeedback - Whether to show default visual feedback
 * @param {number} options.feedbackDuration - Duration of feedback in ms (default: 2000)
 * @returns {Promise<boolean>} - Was the copy operation successful
 */
export const copyWithFeedback = async (
	text,
	{
		onSuccess = null,
		onError = null,
		showFeedback = true,
		feedbackDuration = 2000,
		isDark = false,
	} = {},
) => {
	try {
		console.log(isDark)
		await navigator.clipboard.writeText(text)

		// Handle success
		if (onSuccess) onSuccess()

		// Show visual feedback if requested
		if (showFeedback) {
			const feedbackEl = document.createElement('div')
			feedbackEl.textContent = 'Email copied to clipboard !'
			feedbackEl.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${isDark ? '#00000004' : '#ffffff04'};
        backdrop-filter: blur(28px);
        color: ${isDark ? '#333' : '#ddd'};
        padding: 12px 20px;
        z-index: 10000;
        font-size: 14px;
        opacity: 0;
        transition: opacity 0.3s ease;
      `

			document.body.appendChild(feedbackEl)

			// Animate in
			setTimeout(() => {
				feedbackEl.style.opacity = '1'
			}, 10)

			// Remove after duration
			setTimeout(() => {
				feedbackEl.style.opacity = '0'
				setTimeout(() => document.body.removeChild(feedbackEl), 300)
			}, feedbackDuration)
		}

		return true
	} catch (error) {
		if (onError) onError(error)
		console.error('Copy failed:', error)
		return false
	}
}
