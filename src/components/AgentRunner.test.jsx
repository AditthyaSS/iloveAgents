import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AgentRunner from './AgentRunner'
import { createPersistentExecution, saveExecution, EXECUTION_STATES, STEP_STATES } from '../lib/agentExecutionEngine'

// Mock dependencies
vi.mock('../lib/useApiKey', () => ({
  useApiKey: () => ({
    provider: 'openai',
    setProvider: vi.fn(),
    apiKey: 'sk-test-key-12345',
    setApiKey: vi.fn(),
    saveForSession: false,
    setSaveForSession: vi.fn(),
  }),
}))

vi.mock('../lib/llmAdapter', () => ({
  streamAgent: vi.fn().mockImplementation(async ({ onChunk }) => {
    onChunk('Agent completed output')
    return { content: 'Agent completed output', duration: 120 }
  }),
}))

vi.mock('../lib/useAnalytics', () => ({
  recordAnalyticsRun: vi.fn(),
}))

const mockAgent = {
  id: 'code-reviewer',
  name: 'Code Reviewer',
  description: 'Reviews code for best practices',
  category: 'Engineering',
  icon: 'Code',
  provider: 'any',
  defaultProvider: 'openai',
  systemPrompt: 'You are a reviewer.',
  inputs: [
    {
      id: 'code',
      label: 'Code',
      type: 'textarea',
      placeholder: 'Paste your code here...',
      required: true,
      defaultValue: '',
    },
  ],
}

describe('AgentRunner persistent execution integration', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('renders AgentRunner with agent information', () => {
    render(
      <MemoryRouter>
        <AgentRunner agent={mockAgent} />
      </MemoryRouter>
    )

    expect(screen.getByText('Code Reviewer')).toBeInTheDocument()
    expect(screen.getByText('Reviews code for best practices')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Run Agent/i })).toBeInTheDocument()
  })

  it('initiates persistent execution and displays ExecutionStatusBar with execution ID', async () => {
    render(
      <MemoryRouter>
        <AgentRunner agent={mockAgent} />
      </MemoryRouter>
    )

    const textarea = screen.getByPlaceholderText(/Paste your code here/i)
    fireEvent.change(textarea, { target: { value: 'const x = 1;' } })

    const runBtn = screen.getByRole('button', { name: /Run Agent/i })
    fireEvent.click(runBtn)

    // Verify ExecutionStatusBar rendered with ID
    await waitFor(() => {
      expect(screen.getByText(/ID:/i)).toBeInTheDocument()
    })

    // Verify step pipeline steps are visible
    expect(screen.getByText('Input Validation & Preparation')).toBeInTheDocument()
    expect(screen.getByText('Agent Model Execution')).toBeInTheDocument()
    expect(screen.getByText('Output Processing & Metrics')).toBeInTheDocument()
  })

  it('detects and displays interrupted execution with recovery controls', async () => {
    // Prepopulate storage with an interrupted run
    const existing = createPersistentExecution({
      agentId: mockAgent.id,
      agentName: mockAgent.name,
      inputs: { code: 'function test() {}' },
      steps: [
        { id: 'validate_inputs', name: 'Input Validation & Preparation', status: STEP_STATES.COMPLETED, output: { prepared: true } },
        { id: 'llm_generate', name: 'Agent Model Execution', status: STEP_STATES.RUNNING },
        { id: 'finalize_output', name: 'Output Processing & Metrics', status: STEP_STATES.PENDING },
      ],
    })
    existing.status = EXECUTION_STATES.RUNNING
    saveExecution(existing)

    render(
      <MemoryRouter>
        <AgentRunner agent={mockAgent} />
      </MemoryRouter>
    )

    // Should detect the interrupted run and show the recovery banner
    await waitFor(() => {
      expect(screen.getByText(/Interrupted Run Recoverable/i)).toBeInTheDocument()
    })

    const resumeBtns = screen.getAllByText(/Resume Run/i)
    expect(resumeBtns.length).toBeGreaterThan(0)
    expect(screen.getByText(/without repeating completed work/i)).toBeInTheDocument()
  })
})
