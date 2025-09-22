import gsap from 'gsap'

export default class MouseMagnet {
  constructor(element, settings = {}) {
    if (!element) {
      throw new Error('MouseMagnet requires a DOM element')
    }

    // Default settings
    this.defaultSettings = {
      y: 0.12,
      x: 0.1,
      s: 0.6,
      rs: 0.6,
    }

    // Merge default settings with provided settings
    this.settings = { ...this.defaultSettings, ...settings }

    // Store element reference
    this.element = element

    // Initialize properties
    this.rect = null
    this.centerX = null
    this.centerY = null

    // Bind methods to maintain correct 'this' context
    this._handleMouseEnter = this._handleMouseEnter.bind(this)
    this._handleMouseMove = this._handleMouseMove.bind(this)
    this._handleMouseLeave = this._handleMouseLeave.bind(this)

    // Initialize the mouse magnet behavior
    this.init()
  }

  _calculatePosition() {
    this.rect = this.element.getBoundingClientRect()
    this.centerX = this.rect.left + this.rect.width / 2
    this.centerY = this.rect.top + this.rect.height / 2
  }

  _handleMouseEnter() {
    this._calculatePosition()
  }

  _handleMouseMove(e) {
    const x = (e.clientX - this.centerX) * this.settings.x
    const y = (e.clientY - this.centerY) * this.settings.y

    gsap.to(this.element, {
      x: x,
      y: y,
      force3D: true,
      overwrite: 'auto',
      duration: this.settings.s,
    })
  }

  _handleMouseLeave() {
    gsap.to(this.element, {
      x: 0,
      y: 0,
      force3D: true,
      overwrite: 'auto',
      duration: this.settings.rs,
    })
  }

  init() {
    // Add event listeners
    this.element.addEventListener('mouseenter', this._handleMouseEnter)
    this.element.addEventListener('mousemove', this._handleMouseMove)
    this.element.addEventListener('mouseleave', this._handleMouseLeave)
  }

  destroy() {
    // Clean up event listeners
    this.element.removeEventListener('mouseenter', this._handleMouseEnter)
    this.element.removeEventListener('mousemove', this._handleMouseMove)
    this.element.removeEventListener('mouseleave', this._handleMouseLeave)
  }
}
