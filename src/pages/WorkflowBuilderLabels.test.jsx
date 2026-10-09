import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import WorkflowBuilder from './WorkflowBuilder'

vi.mock('../lib/useAgents', () => {
  const agents = []
  return { useAgents: () => ({ agents }) }
})
vi.mock('../hooks/useWorkflows', () => ({
  saveWorkflow: vi.fn(),
}))

describe('WorkflowBuilder labels', () => {
  it('links labels, exposes the agent picker, and announces errors', () => {
    render(
      <MemoryRouter>
        <WorkflowBuilder />
      </MemoryRouter>
    )
    expect(screen.getByLabelText(/workflow title/i)).toHaveAttribute('id', 'workflow-title')
    expect(screen.getByLabelText(/description/i)).toHaveAttribute('id', 'workflow-description')
    const addButton = screen.getByRole('button', { name: /add first agent/i })
    expect(addButton).toHaveAttribute('aria-haspopup', 'listbox')
  })
})
