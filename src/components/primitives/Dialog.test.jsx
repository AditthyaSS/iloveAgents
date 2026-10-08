import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { useRef } from 'react'
import Dialog, { useDialogBehavior, focusWithoutScroll } from './Dialog'

function Harness({ onClose, returnFocusRef }) {
  const panelRef = useRef(null)
  const initialRef = useRef(null)
  useDialogBehavior({ open: true, onClose, panelRef, initialFocusRef: initialRef, returnFocusRef })
  return (
    <Dialog open onClose={onClose} labelledBy="dlg-title" panelRef={panelRef}>
      <h2 id="dlg-title">Title</h2>
      <button ref={initialRef}>First</button>
      <button>Last</button>
    </Dialog>
  )
}

afterEach(() => {
  document.body.style.overflow = ''
  vi.restoreAllMocks()
})

describe('Dialog primitive', () => {
  it('labels the dialog, locks scroll, and focuses initial content', async () => {
    render(<Harness onClose={vi.fn()} />, { baseElement: document.body })
    expect(screen.getByRole('dialog', { name: 'Title' })).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')
    await waitFor(() => expect(screen.getByRole('button', { name: 'First' })).toHaveFocus())
  })

  it('closes on Escape and restores focus to the trigger', () => {
    const onClose = vi.fn()
    const trigger = document.createElement('button')
    trigger.textContent = 'trigger'
    document.body.appendChild(trigger)
    trigger.focus()
    const returnFocusRef = { current: trigger }
    const { unmount } = render(<Harness onClose={onClose} returnFocusRef={returnFocusRef} />, {
      baseElement: document.body,
    })
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
    unmount()
    expect(trigger).toHaveFocus()
    trigger.remove()
  })

  it('wraps Tab from last to first', () => {
    render(<Harness onClose={vi.fn()} />, { baseElement: document.body })
    const last = screen.getByRole('button', { name: 'Last' })
    last.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus()
  })

  it('focusWithoutScroll tolerates missing elements', () => {
    expect(() => focusWithoutScroll(null)).not.toThrow()
    expect(() => focusWithoutScroll(undefined)).not.toThrow()
  })

  it('renders nothing when closed', () => {
    const { container } = render(
      <Dialog open={false} onClose={vi.fn()} labelledBy="x">
        <div>hidden</div>
      </Dialog>
    )
    expect(container.textContent).toBe('')
  })

  it('advances timers without errors', async () => {
    render(<Harness onClose={vi.fn()} />, { baseElement: document.body })
    await act(async () => {})
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
