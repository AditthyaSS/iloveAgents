import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import WorkflowDetail from './WorkflowDetail'

vi.mock('../lib/useAgents', () => ({
  useAgents: () => ({
    agents: [{ id: 'refund-policy-writer', name: 'Refund Writer', category: 'Business', icon: 'Bot' }],
  }),
}))

vi.mock('../hooks/useWorkflows', () => ({
  fetchWorkflowById: vi.fn(async () => ({
    data: {
      id: 'w1',
      title: 'Support flow',
      description: '',
      usage_count: 3,
      agents: [
        'refund-policy-writer',
        { type: 'conditional_branch', id: 'route', condition: '{{ steps.a.output }}', branches: { x: ['a'] } },
      ],
    },
    error: null,
  })),
  subscribeToWorkflow: vi.fn(() => ({})),
}))

describe('WorkflowDetail conditional rows', () => {
  it('renders branch entries with labels instead of objects', async () => {
    const errors = []
    const origError = console.error
    console.error = (...args) => {
      errors.push(args.join(' '))
    }
    try {
      render(
        <MemoryRouter initialEntries={['/workflows/w1']}>
          <Routes>
            <Route path="/workflows/:id" element={<WorkflowDetail />} />
          </Routes>
        </MemoryRouter>
      )
      expect(await screen.findByText('Branch: route')).toBeInTheDocument()
      expect(screen.queryByText('[object Object]')).toBeNull()
      expect(errors.some((m) => m.includes('duplicate') && m.includes('key'))).toBe(false)
    } finally {
      console.error = origError
    }
  })
})
