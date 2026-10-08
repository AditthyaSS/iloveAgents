import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AutomationRunDrawer from './AutomationRunDrawer'

vi.mock('./OutputRenderer', () => ({ default: () => null }))

const run = {
  status: 'success',
  automationName: 'Morning Brief',
  agentName: 'Summarizer',
  output: 'hello',
  startedAt: Date.now(),
}

describe('AutomationRunDrawer dialog', () => {
  it('exposes a labelled dialog and closes on Escape', () => {
    const onClose = vi.fn()
    render(<AutomationRunDrawer run={run} isOpen onClose={onClose} />)
    expect(screen.getByRole('dialog', { name: /run execution details/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/copy output/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/download markdown/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/close run details/i)).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('moves focus in, traps Tab, and restores focus on close', () => {
    const onClose = vi.fn()
    const trigger = document.createElement('button')
    trigger.textContent = 'open drawer'
    document.body.appendChild(trigger)
    trigger.focus()
    const { unmount } = render(<AutomationRunDrawer run={run} isOpen onClose={onClose} />)
    expect(screen.getByRole('dialog')).toHaveFocus()
    const dialog = screen.getByRole('dialog')
    const buttons = Array.from(dialog.querySelectorAll('button'))
    buttons[buttons.length - 1].focus()
    fireEvent.keyDown(window, { key: 'Tab' })
    expect(buttons[0]).toHaveFocus()
    unmount()
    expect(trigger).toHaveFocus()
    trigger.remove()
  })
})
