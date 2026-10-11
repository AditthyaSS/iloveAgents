import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AgentPage from './AgentPage'
import { RECENT_AGENTS_STORAGE_KEY } from '../lib/recentAgents'

vi.mock('../lib/useAgents', () => ({
  useAgents: () => ({
    agents: [
      { id: 'code-reviewer', name: 'Code Reviewer' },
      { id: 'api-doc-gen', name: 'API Doc Generator' },
    ],
    loading: false,
  }),
}))

vi.mock('../components/AgentRunner', () => ({
  default: ({ agent }) => <div data-testid="agent-runner">{agent.name}</div>,
}))

describe('AgentPage localStorage resilience', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renders without throwing when recentAgents contains malformed JSON', () => {
    localStorage.setItem(RECENT_AGENTS_STORAGE_KEY, '{invalid-json')

    expect(() => {
      render(
        <MemoryRouter initialEntries={['/agent/code-reviewer']}>
          <Routes>
            <Route path="/agent/:id" element={<AgentPage />} />
          </Routes>
        </MemoryRouter>
      )
    }).not.toThrow()

    expect(screen.getByTestId('agent-runner')).toHaveTextContent('Code Reviewer')
    expect(JSON.parse(localStorage.getItem(RECENT_AGENTS_STORAGE_KEY))).toEqual([
      'code-reviewer',
    ])
  })

  it('renders without throwing when recentAgents contains a non-array JSON object', () => {
    localStorage.setItem(
      RECENT_AGENTS_STORAGE_KEY,
      JSON.stringify({ 'api-doc-gen': true })
    )

    expect(() => {
      render(
        <MemoryRouter initialEntries={['/agent/code-reviewer']}>
          <Routes>
            <Route path="/agent/:id" element={<AgentPage />} />
          </Routes>
        </MemoryRouter>
      )
    }).not.toThrow()

    expect(JSON.parse(localStorage.getItem(RECENT_AGENTS_STORAGE_KEY))).toEqual([
      'code-reviewer',
    ])
  })
})
