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

describe('WorkflowLibrary search', () => {
  it('names the search box and the clear control', () => {
    render(
      <MemoryRouter>
        <WorkflowLibrary />
      </MemoryRouter>
    )
    const box = screen.getByLabelText(/search workflows/i)
    fireEvent.change(box, { target: { value: 'demo' } })
    const clear = screen.getByLabelText(/clear workflow search/i)
    fireEvent.click(clear)
    expect(box.value).toBe('')
  })
})
