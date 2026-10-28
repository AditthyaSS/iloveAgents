import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import KeyboardShortcutsModal from './KeyboardShortcutsModal'

describe('KeyboardShortcutsModal dialog', () => {
  it('exposes a labelled dialog and closes on Escape', () => {
    const onClose = vi.fn()
    render(<KeyboardShortcutsModal isOpen onClose={onClose} />)
    expect(screen.getByRole('dialog', { name: /Keyboard shortcuts/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Close dialog/i })).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('ignores Escape while closed', () => {
    const onClose = vi.fn()
    render(<KeyboardShortcutsModal isOpen={false} onClose={onClose} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })
})
