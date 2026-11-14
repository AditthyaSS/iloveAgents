import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import WorkflowRunner from './WorkflowRunner'
import { runAgent } from '../lib/llmAdapter'
import { saveGlobalKeys } from '../lib/globalKeys'

vi.mock('../lib/llmAdapter', () => ({
  runAgent: vi.fn(),
}))

vi.mock('../lib/useAnalytics', () => ({
  recordAnalyticsRun: vi.fn(),
}))

vi.mock('../hooks/useWorkflows', () => ({
  fetchWorkflowById: vi.fn(),
  incrementUsage: vi.fn(),
}))

const mockAgents = [
  {
    id: 'agent-openai',
    name: 'OpenAI Agent',
    provider: 'openai',
    model: 'gpt-4o',
    systemPrompt: 'System prompt 1',
  },
  {
    id: 'agent-anthropic',
    name: 'Anthropic Agent',
    provider: 'anthropic',
    model: 'claude-3-5-sonnet',
    systemPrompt: 'System prompt 2',
  },
]

vi.mock('../lib/useAgents', () => ({
  useAgents: () => ({ agents: mockAgents, loading: false }),
}))

describe('WorkflowRunner multi-provider API key resolution', () => {
  const workflowDef = {
    id: 'wf-multi-provider',
    title: 'Multi-Provider Workflow',
    agents: ['agent-openai', 'agent-anthropic'],
  }

  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    vi.clearAllMocks()
    runAgent.mockResolvedValue({
      content: 'Step completed output',
      duration: 100,
    })
  })

  afterEach(() => {
    sessionStorage.clear()
    localStorage.clear()
  })

  it('passes unparsed key string (not JSON) to runAgent for multi-provider step from sessionStorage', async () => {
    // Session key for anthropic saved via useApiKey
    sessionStorage.setItem(
      'ila_apikey_anthropic',
      JSON.stringify({
        key: 'sk-ant-valid-key',
        expiresAt: Date.now() + 60 * 60 * 1000,
      })
    )

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/workflows/wf-multi-provider/run',
            state: { workflow: workflowDef, initialInput: 'Hello' },
          },
        ]}
      >
        <WorkflowRunner />
      </MemoryRouter>
    )

    // Type OpenAI API key in the input field
    const apiKeyInput = screen.getByPlaceholderText(/Enter your openai API key/i)
    fireEvent.change(apiKeyInput, { target: { value: 'sk-openai-test-key' } })

    const runBtn = screen.getByRole('button', { name: /Run Workflow/i })
    fireEvent.click(runBtn)

    await waitFor(() => {
      expect(runAgent).toHaveBeenCalledTimes(2)
    })

    // Step 1: uses OpenAI active key
    expect(runAgent).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        provider: 'openai',
        apiKey: 'sk-openai-test-key',
      })
    )

    // Step 2: uses Anthropic session key extracted string, NOT JSON string
    expect(runAgent).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        provider: 'anthropic',
        apiKey: 'sk-ant-valid-key',
      })
    )
    expect(runAgent.mock.calls[1][0].apiKey).not.toContain('{')
    expect(runAgent.mock.calls[1][0].apiKey).not.toContain('expiresAt')
  })

  it('falls back to global keys configured in Settings for multi-provider step', async () => {
    saveGlobalKeys({
      anthropic: 'sk-ant-from-global-settings',
    })

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/workflows/wf-multi-provider/run',
            state: { workflow: workflowDef, initialInput: 'Hello' },
          },
        ]}
      >
        <WorkflowRunner />
      </MemoryRouter>
    )

    const apiKeyInput = screen.getByPlaceholderText(/Enter your openai API key/i)
    fireEvent.change(apiKeyInput, { target: { value: 'sk-openai-test-key' } })

    const runBtn = screen.getByRole('button', { name: /Run Workflow/i })
    fireEvent.click(runBtn)

    await waitFor(() => {
      expect(runAgent).toHaveBeenCalledTimes(2)
    })

    expect(runAgent).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        provider: 'anthropic',
        apiKey: 'sk-ant-from-global-settings',
      })
    )
  })

  it('marks step as failed with descriptive message when provider key is missing without crashing', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/workflows/wf-multi-provider/run',
            state: { workflow: workflowDef, initialInput: 'Hello' },
          },
        ]}
      >
        <WorkflowRunner />
      </MemoryRouter>
    )

    const apiKeyInput = screen.getByPlaceholderText(/Enter your openai API key/i)
    fireEvent.change(apiKeyInput, { target: { value: 'sk-openai-test-key' } })

    const runBtn = screen.getByRole('button', { name: /Run Workflow/i })
    fireEvent.click(runBtn)

    // Step 1 succeeds, step 2 fails due to missing anthropic key
    await waitFor(() => {
      expect(runAgent).toHaveBeenCalledTimes(1)
      expect(screen.getByText(/API key for provider "anthropic" is not configured\./i)).toBeInTheDocument()
    })
  })
})
