import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../lib/useAgents', () => ({
  useAgents: () => ({
    agents: [
      { id: 'a1', name: 'Code Reviewer', category: 'Engineering', icon: 'Bot' },
      { id: 'a2', name: 'Summarizer', category: 'Productivity', icon: 'Bot' },
    ],
  }),
}))

vi.mock('../hooks/useWorkflows', () => ({
  saveWorkflow: vi.fn(),
}))

vi.mock('../lib/useDocumentTitle', () => ({
  useDocumentTitle: vi.fn(),
}))

import WorkflowBuilder from './WorkflowBuilder'

function setup() {
  render(
    <MemoryRouter>
      <WorkflowBuilder />
    </MemoryRouter>
  )
}

describe('WorkflowBuilder keyboard access', () => {
  it('add button exposes expanded state', () => {
    setup()
    const add = screen.getByRole('button', { name: /Add first agent/i })
    expect(add).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(add)
    expect(add).toHaveAttribute('aria-expanded', 'true')
  })

  it('steps become focusable with move controls and live announcements', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: /Add first agent/i }))
    fireEvent.click(screen.getByRole('button', { name: /Code Reviewer/i }))
    fireEvent.click(screen.getByRole('button', { name: /Add next agent/i }))
    fireEvent.click(screen.getByRole('button', { name: /Summarizer/i }))

    const step = screen.getByRole('listitem', { name: /Step 1 of 2: Code Reviewer/i })
    expect(step).toHaveAttribute('tabindex', '0')

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent(/Added Summarizer as step 2/i)

    fireEvent.click(screen.getByRole('button', { name: /Move Code Reviewer down/i }))
    expect(screen.getByRole('status')).toHaveTextContent(/Moved Code Reviewer to position 2 of 2/i)

    const moved = screen.getByRole('listitem', { name: /Step 2 of 2: Code Reviewer/i })
    fireEvent.keyDown(moved, { key: 'ArrowUp', altKey: true })
    expect(screen.getByRole('status')).toHaveTextContent(/Moved Code Reviewer to position 1 of 2/i)
  })
})
