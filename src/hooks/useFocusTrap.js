import { useEffect, useRef } from 'react'

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

/**
 * Traps keyboard focus within a container while active, and restores focus on deactivation.
 * @param {boolean} active - Whether the focus trap is currently active.
 * @returns {import('react').RefObject<HTMLElement>} Ref to attach to the container element.
 */
export function useFocusTrap(active) {
  const containerRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    if (!active) return

    previousFocusRef.current = document.activeElement

    const container = containerRef.current
    if (!container) return

    const focusFirst = () => {
      const first = container.querySelector(FOCUSABLE)
      if (first) first.focus()
      else container.focus()
    }

    requestAnimationFrame(focusFirst)

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return

      const focusable = [...container.querySelectorAll(FOCUSABLE)]
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus()
      }
    }
  }, [active])

  return containerRef
}
