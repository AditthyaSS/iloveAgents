import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import WorkflowLibrary from './WorkflowLibrary'

vi.mock('../lib/useAgents', () => {
  const agents = []
  return { useAgents: () => ({ agents }) }
})
vi.mock('../hooks/useWorkflows', () => ({
  fetchWorkflows: vi.fn(async () => ({ data: [], error: null })),
  subscribeToAllWorkflows: vi.fn(() => () => {}),
  incrementUsage: vi.fn(),
}))
vi.mock('../lib/supabase', () => ({
  supabase: { removeChannel: vi.fn() },
}))

describe('WorkflowLibrary empty state', () => {
  it('announces the empty state', async () => {
    render(
      <MemoryRouter>
        <WorkflowLibrary />
      </MemoryRouter>
    )
    const box = screen.getByPlaceholderText(/search workflows/i)
    fireEvent.change(box, { target: { value: 'zzz-no-match' } })
    expect(await screen.findByRole('status')).toHaveTextContent(/no workflows found/i)
  })
})
