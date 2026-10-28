import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ScheduleAgentModal from './ScheduleAgentModal'

vi.mock('../lib/automationsService', () => ({
  SCHEDULE_PRESETS: [{ value: 'daily', label: 'Daily' }],
  createAutomation: vi.fn(),
}))

const agent = { id: 'a1', name: 'Agent One', category: 'Test', systemPrompt: 'p', inputs: [] }

describe('ScheduleAgentModal dialog', () => {
  it('exposes a labelled dialog and closes on Escape', () => {
    const onClose = vi.fn()
    render(<ScheduleAgentModal agent={agent} inputs={{}} provider="openai" apiKey="" onClose={onClose} />)
    expect(screen.getByRole('dialog', { name: /Schedule agent autopilot/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Close dialog/i })).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
