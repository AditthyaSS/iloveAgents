import { useEffect, useRef } from 'react'

// Open overlays (modals, the mobile drawer), oldest first. Only the last one
// answers Escape, so stacked dialogs close one at a time.
const openOverlays = []

export const hasOpenOverlay = () => openOverlays.length > 0

/**
 * Close an overlay on Escape and give focus back to whatever opened it.
 *
 * The listener runs in the capture phase and stops the event, so window-level
 * shortcuts such as AgentRunner's Escape-to-clear never see an Escape that was
 * meant for the overlay.
 */
export function useOverlayEscape(open, onClose) {
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined
    const token = {}
    const opener = document.activeElement
    openOverlays.push(token)

    const onKey = (e) => {
      if (e.key !== 'Escape' || openOverlays[openOverlays.length - 1] !== token) return
      e.stopImmediatePropagation()
      if (!e.repeat) onCloseRef.current?.()
    }
    window.addEventListener('keydown', onKey, true)

    return () => {
      window.removeEventListener('keydown', onKey, true)
      openOverlays.splice(openOverlays.indexOf(token), 1)
      if (opener instanceof HTMLElement && opener.isConnected && opener !== document.body) opener.focus()
    }
  }, [open])
}
