import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export function focusWithoutScroll(element) {
  if (!element) return
  try {
    element.focus({ preventScroll: true })
  } catch {
    element.focus()
  }
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), a[href], textarea, input, select, [tabindex]:not([tabindex="-1"])'

export function useDialogBehavior({ open, onClose, panelRef, initialFocusRef, returnFocusRef }) {
  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => {
      focusWithoutScroll(initialFocusRef?.current ?? panelRef?.current)
    }, 0)

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose?.()
        return
      }
      if (event.key !== 'Tab' || !panelRef?.current) return
      const focusable = [...panelRef.current.querySelectorAll(FOCUSABLE_SELECTOR)]
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const activeElement = document.activeElement
      if (event.shiftKey && (activeElement === first || !focusable.includes(activeElement))) {
        event.preventDefault()
        focusWithoutScroll(last)
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault()
        focusWithoutScroll(first)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.clearTimeout(focusTimer)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      focusWithoutScroll(returnFocusRef?.current)
    }
  }, [open, onClose, panelRef, initialFocusRef, returnFocusRef])
}

export default function Dialog({
  open,
  onClose,
  labelledBy,
  describedBy,
  panelRef,
  overlayClassName = 'fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4',
  backdropClassName = 'absolute inset-0 bg-gray-950/60 backdrop-blur-sm',
  panelClassName = 'relative w-full max-w-2xl rounded-xl border bg-white shadow-2xl dark:border-border dark:bg-surface-card',
  children,
}) {
  if (!open) return null
  return createPortal(
    <div className={overlayClassName} role="presentation">
      <div className={backdropClassName} onClick={onClose} aria-hidden="true" />
      <section ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={labelledBy} aria-describedby={describedBy} className={panelClassName}>
        {children}
      </section>
    </div>,
    document.body
  )
}
