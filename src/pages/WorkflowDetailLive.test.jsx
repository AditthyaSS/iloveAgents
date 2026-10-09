import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import WorkflowDetail from './WorkflowDetail'
import { fetchWorkflowById, subscribeToWorkflow } from '../hooks/useWorkflows'

vi.mock('../hooks/useWorkflows', () => ({
  fetchWorkflowById: vi.fn(),
  subscribeToWorkflow: vi.fn(() => () => {}),
  incrementUsage: vi.fn(),
}))
vi.mock('../lib/useAgents', () => {
  const agents = []
  return { useAgents: () => ({ agents }) }
})
vi.mock('../lib/supabase', () => ({
  supabase: { removeChannel: vi.fn() },
}))

function setup() {
  return render(
    <MemoryRouter initialEntries={['/workflows/w1']}>
      <Routes>
        <Route path="/workflows/:id" element={<WorkflowDetail />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('WorkflowDetail live regions', () => {
  it('announces loading', () => {
    fetchWorkflowById.mockReturnValue(new Promise(() => {}))
    setup()
    expect(screen.getByRole('status')).toHaveTextContent(/loading workflow/i)
  })

  it('announces the live run count', async () => {
    fetchWorkflowById.mockResolvedValue({
      data: { id: 'w1', title: 'Demo', description: '', agents: [], usage_count: 7 },
      error: null,
    })
    setup()
    await act(async () => {})
    expect(screen.getByLabelText(/7 runs/i)).toBeInTheDocument()
  })
})
