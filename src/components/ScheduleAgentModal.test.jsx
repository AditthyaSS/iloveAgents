import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ScheduleAgentModal from './ScheduleAgentModal'

vi.mock('../lib/automationsService', () => ({
  SCHEDULE_PRESETS: [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ],
  createAutomation: vi.fn(),
}))

const agent = { name: 'Summarizer', inputs: [] }

describe('ScheduleAgentModal dialog', () => {
  it('exposes a labelled dialog, pressed frequency, and Escape close', () => {
    const onClose = vi.fn()
    render(
      <ScheduleAgentModal
        agent={agent}
        inputs={{}}
        provider="openai"
        apiKey=""
        onSchedule={vi.fn()}
        onClose={onClose}
      />
    )
    expect(screen.getByRole('dialog', { name: /schedule agent autopilot/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/close schedule dialog/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Daily' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('moves focus in, traps Tab, and restores focus on close', () => {
    const onClose = vi.fn()
    const trigger = document.createElement('button')
    trigger.textContent = 'schedule'
    document.body.appendChild(trigger)
    trigger.focus()
    const { unmount } = render(
      <ScheduleAgentModal
        agent={agent}
        inputs={{}}
        provider="openai"
        apiKey=""
        onSchedule={vi.fn()}
        onClose={onClose}
      />
    )
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
