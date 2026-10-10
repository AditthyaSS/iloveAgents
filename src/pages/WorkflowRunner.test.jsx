import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import WorkflowRunner from './WorkflowRunner'
import { runAgent } from '../lib/llmAdapter'

vi.mock('../lib/llmAdapter', () => ({
  runAgent: vi.fn(),
}))
vi.mock('../lib/useAnalytics', () => ({
  recordAnalyticsRun: vi.fn(),
}))
vi.mock('../lib/useAgents', () => {
  const agents = [
    { id: 'a1', name: 'Agent One', provider: 'openai', systemPrompt: 'sys', inputs: [] },
  ]
  return { useAgents: () => ({ agents }) }
})
vi.mock('../lib/useApiKey', () => ({
  useApiKey: () => ({
    provider: 'openai',
    setProvider: vi.fn(),
    apiKey: 'sk-test',
    setApiKey: vi.fn(),
    saveForSession: true,
    setSaveForSession: vi.fn(),
  }),
}))
vi.mock('../hooks/useWorkflows', () => ({
  fetchWorkflowById: vi.fn(),
  incrementUsage: vi.fn(),
}))
vi.mock('../components/ApiKeyBar', () => ({ default: () => null }))
vi.mock('../components/OutputRenderer', () => ({ default: () => null }))
vi.mock('../components/RunRating', () => ({ default: () => null }))

const workflow = { id: 'w1', title: 'Demo Flow', agents: ['a1', 'a1'] }

function setup() {
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: '/workflows/w1/run', state: { workflow, initialInput: 'go' } }]}
    >
      <Routes>
        <Route path="/workflows/:id/run" element={<WorkflowRunner />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('WorkflowRunner stop', () => {
  it('stops the chain, marks steps cancelled, and never runs later steps', async () => {
    let resolveFirst
    runAgent.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFirst = resolve
      })
    )
    setup()
    fireEvent.click(screen.getByRole('button', { name: /run workflow/i }))
    await act(async () => {})
    expect(runAgent).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /stop workflow run/i }))
    resolveFirst({ content: 'late output', duration: 5 })
    await act(async () => {})

    expect(runAgent).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })
}, 15000)
