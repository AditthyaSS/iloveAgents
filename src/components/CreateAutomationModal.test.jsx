import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CreateAutomationModal from './CreateAutomationModal'

vi.mock('../lib/automationsService', () => ({
  SCHEDULE_PRESETS: [{ value: 'daily', label: 'Daily' }],
  createAutomation: vi.fn(),
  updateAutomation: vi.fn(),
}))
vi.mock('../lib/useAgents', () => {
  const agents = [{ id: 'a1', name: 'Agent One', description: 'd', category: 'Test', provider: 'openai', icon: 'Bot', inputs: [] }]
  return { useAgents: () => ({ agents, loading: false, error: null }) }
})
vi.mock('../lib/useApiKey', () => ({
  useApiKey: () => ({ apiKey: '' }),
}))

describe('CreateAutomationModal dialog', () => {
  it('exposes a labelled dialog and closes on Escape', () => {
    const onClose = vi.fn()
    render(<CreateAutomationModal isOpen onClose={onClose} />)
    expect(screen.getByRole('dialog', { name: /Schedule AI agent autopilot/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Close dialog/i })).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('ignores Escape while closed', () => {
    const onClose = vi.fn()
    render(<CreateAutomationModal isOpen={false} onClose={onClose} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })
})
