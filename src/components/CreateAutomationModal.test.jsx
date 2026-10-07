import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CreateAutomationModal from './CreateAutomationModal'

vi.mock('../lib/useAgents', () => ({
  useAgents: () => ({ agents: [], loading: false, error: null }),
}))
vi.mock('../lib/useApiKey', () => ({
  useApiKey: () => ({ apiKey: '' }),
}))
vi.mock('../lib/automationsService', () => ({
  SCHEDULE_PRESETS: [
    { value: 'daily', label: 'Daily', description: 'Every day', cron: '0 9 * * *' },
    { value: 'weekly', label: 'Weekly', description: 'Every week', cron: '0 9 * * 1' },
  ],
  createAutomation: vi.fn(),
  updateAutomation: vi.fn(),
}))

describe('CreateAutomationModal dialog', () => {
  it('exposes a labelled dialog, pressed schedule, and Escape close', () => {
    const onClose = vi.fn()
    render(<CreateAutomationModal isOpen onClose={onClose} onSuccess={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: /schedule automation/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/close automation dialog/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /daily/i })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
