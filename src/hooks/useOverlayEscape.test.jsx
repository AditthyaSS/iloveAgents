import { afterEach, describe, it, expect, vi } from 'vitest'
import { render, fireEvent, cleanup } from '@testing-library/react'
import { useOverlayEscape, hasOpenOverlay } from './useOverlayEscape'

function Overlay({ open = true, onClose }) {
  useOverlayEscape(open, onClose)
  return open ? <div role="dialog" aria-modal="true" /> : null
}

afterEach(cleanup)

describe('useOverlayEscape', () => {
  it('closes on Escape without letting window shortcuts see the key', () => {
    const onClose = vi.fn()
    const shortcut = vi.fn()
    window.addEventListener('keydown', shortcut)
    render(<Overlay onClose={onClose} />)

    fireEvent.keyDown(document.body, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(shortcut).not.toHaveBeenCalled()
    window.removeEventListener('keydown', shortcut)
  })

  it('closes only the topmost of two stacked overlays', () => {
    const closeBottom = vi.fn()
    const closeTop = vi.fn()
    render(
      <>
        <Overlay onClose={closeBottom} />
        <Overlay onClose={closeTop} />
      </>
    )

    fireEvent.keyDown(document.body, { key: 'Escape' })

    expect(closeTop).toHaveBeenCalledTimes(1)
    expect(closeBottom).not.toHaveBeenCalled()
  })

  it('ignores a held (repeating) Escape', () => {
    const onClose = vi.fn()
    render(<Overlay onClose={onClose} />)

    fireEvent.keyDown(document.body, { key: 'Escape', repeat: true })

    expect(onClose).not.toHaveBeenCalled()
  })

  it('reports open overlays and leaves other keys alone while closed', () => {
    const onClose = vi.fn()
    const { rerender } = render(<Overlay onClose={onClose} />)
    expect(hasOpenOverlay()).toBe(true)

    rerender(<Overlay open={false} onClose={onClose} />)
    expect(hasOpenOverlay()).toBe(false)

    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('gives focus back to the element that opened it', () => {
    const opener = document.createElement('button')
    document.body.appendChild(opener)
    opener.focus()

    const { rerender } = render(<Overlay onClose={() => {}} />)
    document.body.focus()
    rerender(<Overlay open={false} onClose={() => {}} />)

    expect(document.activeElement).toBe(opener)
    opener.remove()
  })
})
