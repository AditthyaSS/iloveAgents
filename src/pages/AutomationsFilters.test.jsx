import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AutomationsPage from './AutomationsPage'

vi.mock('../lib/automationsService', () => ({
  loadAutomations: () => [],
  loadRuns: () => [],
  toggleAutomation: vi.fn(),
  deleteAutomation: vi.fn(),
  runAutomationNow: vi.fn(),
  initAutomationEngine: vi.fn(() => () => {}),
}))
vi.mock('../lib/useAgents', () => {
  const agents = []
  return { useAgents: () => ({ agents }) }
})
vi.mock('../components/CreateAutomationModal', () => ({ default: () => null }))

describe('AutomationsPage filters', () => {
  it('names search, selects, and refresh', () => {
    render(
      <MemoryRouter>
        <AutomationsPage />
      </MemoryRouter>
    )
    expect(screen.getByLabelText(/search automations or agents/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/filter by status/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/filter by schedule/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /refresh automation list/i })).toBeInTheDocument()
  })
})
