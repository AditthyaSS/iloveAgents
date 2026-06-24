import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef(null)
  const trailRef = useRef(null)

  useEffect(() => {
    const canUseCursor =
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!canUseCursor) return undefined

    let frameId
    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const trail = { x: pointer.x, y: pointer.y }

    const moveCursor = (event) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
    }

    const animate = () => {
      trail.x += (pointer.x - trail.x) * 0.16
      trail.y += (pointer.y - trail.y) * 0.16

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`
      }

      if (trailRef.current) {
        trailRef.current.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0)`
      }

      frameId = window.requestAnimationFrame(animate)
    }

    window.addEventListener('pointermove', moveCursor, { passive: true })
    frameId = window.requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('pointermove', moveCursor)
      window.cancelAnimationFrame(frameId)
    }
  }, [])

  return (
    <>
      <span ref={trailRef} className="premium-cursor-trail" aria-hidden="true" />
      <span ref={cursorRef} className="premium-cursor-core" aria-hidden="true" />
    </>
  )
}
