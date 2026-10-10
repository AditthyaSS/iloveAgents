import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AgentPage from './AgentPage'
import AutomationDetailPage from './AutomationDetailPage'

vi.mock('../lib/useAgents', () => {
  const agents = [{ id: 'a1', name: 'Agent One' }]
  return { useAgents: () => ({ agents, loading: true }) }
})
vi.mock('../components/AgentRunner', () => ({ default: () => null }))
vi.mock('../lib/automationsService', () => ({
  getAutomation: () => ({
    id: 'auto1', name: 'Morning Brief', agentId: 'a1', agentName: 'Agent One',
    schedule: 'daily', enabled: true, inputs: {}, model: 'gpt-4o',
  }),
  getRunsForAutomation: () => [],
  getEmailLogs: () => [],
  toggleAutomation: vi.fn(),
  deleteAutomation: vi.fn(),
  runAutomationNow: vi.fn(),
  updateAutomation: vi.fn(),
  removeAutomationKey: vi.fn(),
}))
vi.mock('../components/AutomationRunDrawer', () => ({ default: () => null }))
vi.mock('../components/CreateAutomationModal', () => ({ default: () => null }))

describe('loading and tab semantics', () => {
  it('shows an announced skeleton while the agent loads', () => {
    render(
      <MemoryRouter initialEntries={['/agent/a1']}>
        <Routes>
          <Route path="/agent/:id" element={<AgentPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByRole('status', { name: /loading agent/i })).toBeInTheDocument()
  })

  it('exposes automation tabs with panels', () => {
    render(
      <MemoryRouter initialEntries={['/automations/auto1']}>
        <Routes>
          <Route path="/automations/:id" element={<AutomationDetailPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByRole('tablist', { name: /automation details/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { selected: true })).toBeInTheDocument()
    expect(screen.getByRole('tabpanel')).toBeInTheDocument()
  })
})
