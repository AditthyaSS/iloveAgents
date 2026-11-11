/**
 * Lightweight canvas confetti animation for victory celebration.
 * Zero external dependencies.
 */

const CONFETTI_COLORS = [
  '#f59e0b', // amber
  '#eab308', // yellow
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#14b8a6', // teal
  '#ec4899', // pink
  '#10b981', // emerald
  '#f97316', // orange
]

/**
 * Launches a celebratory confetti burst across the screen.
 * @param {Object} options
 * @param {number} [options.duration=3200] - Duration in ms
 * @param {number} [options.particleCount=80] - Number of particles
 * @returns {Function} Cleanup function to stop animation early
 */
export function launchConfetti({ duration = 3200, particleCount = 80 } = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {}
  }

  const canvas = document.createElement('canvas')
  canvas.style.position = 'fixed'
  canvas.style.top = '0'
  canvas.style.left = '0'
  canvas.style.width = '100vw'
  canvas.style.height = '100vh'
  canvas.style.pointerEvents = 'none'
  canvas.style.zIndex = '9999'
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    if (canvas.isConnected) document.body.removeChild(canvas)
    return () => {}
  }

  let width = (canvas.width = window.innerWidth)
  let height = (canvas.height = window.innerHeight)

  const handleResize = () => {
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
  }
  window.addEventListener('resize', handleResize)

  const particles = Array.from({ length: particleCount }).map(() => ({
    x: width * 0.5 + (Math.random() - 0.5) * 160,
    y: height * 0.4 + (Math.random() - 0.5) * 100,
    vx: (Math.random() - 0.5) * 18,
    vy: -Math.random() * 15 - 5,
    size: Math.random() * 8 + 4,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rotation: Math.random() * 360,
    vRotation: (Math.random() - 0.5) * 12,
    opacity: 1,
    shape: Math.random() > 0.35 ? 'rect' : 'circle',
  }))

  const startTime = Date.now()
  let animationId = null
  let stopped = false

  const cleanup = () => {
    stopped = true
    if (animationId) cancelAnimationFrame(animationId)
    window.removeEventListener('resize', handleResize)
    if (canvas.isConnected) {
      document.body.removeChild(canvas)
    }
  }

  const animate = () => {
    if (stopped) return

    const elapsed = Date.now() - startTime
    if (elapsed > duration) {
      cleanup()
      return
    }

    ctx.clearRect(0, 0, width, height)

    const progress = elapsed / duration
    const fadeOut = progress > 0.65 ? (1 - progress) / 0.35 : 1

    particles.forEach(p => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.38 // gravity
      p.vx *= 0.985 // drag
      p.rotation += p.vRotation

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate((p.rotation * Math.PI) / 180)
      ctx.globalAlpha = Math.max(0, p.opacity * fadeOut)
      ctx.fillStyle = p.color

      if (p.shape === 'circle') {
        ctx.beginPath()
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      }

      ctx.restore()
    })

    animationId = requestAnimationFrame(animate)
  }

  animationId = requestAnimationFrame(animate)

  return cleanup
}
