import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import KeyboardShortcutsModal from './KeyboardShortcutsModal'

vi.mock('../lib/useAgents', () => ({
  useAgents: () => ({ agents: [] }),
}))

describe('modal dialog a11y', () => {
  it('keyboard shortcuts modal exposes dialog role and closes on Escape', () => {
    const onClose = vi.fn()
    render(<KeyboardShortcutsModal isOpen onClose={onClose} />)
    const dialog = screen.getByRole('dialog', { name: /Keyboard shortcuts/i })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByRole('button', { name: /Close keyboard shortcuts dialog/i })).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('returns null when closed', () => {
    const { container } = render(<KeyboardShortcutsModal isOpen={false} onClose={() => {}} />)
    expect(container.firstChild).toBeNull()
  })
})
