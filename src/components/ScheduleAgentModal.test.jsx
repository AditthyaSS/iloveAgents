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
})
