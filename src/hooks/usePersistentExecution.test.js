import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePersistentExecution } from './usePersistentExecution'
import {
  createPersistentExecution,
  saveExecution,
  EXECUTION_STATES,
  STEP_STATES,
} from '../lib/agentExecutionEngine'

// Mock streamAgent and analytics
vi.mock('../lib/llmAdapter', () => ({
  streamAgent: vi.fn().mockImplementation(async ({ onChunk }) => {
    onChunk('Chunk 1 ')
    onChunk('Chunk 2')
    return { content: 'Chunk 1 Chunk 2', duration: 150 }
  }),
}))

vi.mock('../lib/useAnalytics', () => ({
  recordAnalyticsRun: vi.fn(),
}))

describe('usePersistentExecution Hook', () => {
  const mockAgent = {
    id: 'test-agent',
    name: 'Test Agent',
    systemPrompt: 'System instructions',
    inputs: [{ id: 'input_text', label: 'Text', type: 'text', required: true }],
  }

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('initializes with null execution when storage is empty', () => {
    const { result } = renderHook(() =>
      usePersistentExecution({ agent: mockAgent })
    )

    expect(result.current.execution).toBeNull()
    expect(result.current.isRunning).toBe(false)
    expect(result.current.isInterrupted).toBe(false)
    expect(result.current.progressPercent).toBe(0)
  })

  it('rehydrates interrupted execution on mount', () => {
    // Simulate an execution that was running when user refreshed the browser
    const existing = createPersistentExecution({
      agentId: mockAgent.id,
      agentName: mockAgent.name,
      steps: [
        { id: 'validate_inputs', status: STEP_STATES.COMPLETED, output: { prepared: true } },
        { id: 'llm_generate', status: STEP_STATES.RUNNING },
      ],
    })
    existing.status = EXECUTION_STATES.RUNNING
    saveExecution(existing)

    const { result } = renderHook(() =>
      usePersistentExecution({ agent: mockAgent })
    )

    expect(result.current.execution).toBeDefined()
    expect(result.current.isInterrupted).toBe(true)
    expect(result.current.execution.status).toBe(EXECUTION_STATES.INTERRUPTED)
  })

  it('starts execution, updates progress, and calls onComplete', async () => {
    const onComplete = vi.fn()
    const onSaveRun = vi.fn()
    const onAddSpend = vi.fn()

    const { result } = renderHook(() =>
      usePersistentExecution({
        agent: mockAgent,
        onComplete,
        onSaveRun,
        onAddSpend,
      })
    )

    await act(async () => {
      await result.current.startExecution({
        agentDef: mockAgent,
        inputs: { input_text: 'Sample input' },
        provider: 'openai',
        selectedModel: 'gpt-4o',
        apiKey: 'test-key',
      })
    })

    expect(result.current.execution).toBeDefined()
    expect(result.current.isCompleted).toBe(true)
    expect(result.current.progressPercent).toBe(100)
    expect(onComplete).toHaveBeenCalledWith('Chunk 1 Chunk 2', expect.any(Number))
    expect(onSaveRun).toHaveBeenCalled()
    expect(onAddSpend).toHaveBeenCalled()
  })

  it('cancels an in-flight execution', () => {
    const { result } = renderHook(() =>
      usePersistentExecution({ agent: mockAgent })
    )

    const exec = createPersistentExecution({
      agentId: mockAgent.id,
      steps: [{ id: 'step_1', status: STEP_STATES.RUNNING }],
    })
    exec.status = EXECUTION_STATES.RUNNING
    saveExecution(exec)

    act(() => {
      result.current.setExecution(exec)
    })

    act(() => {
      result.current.cancelExecution()
    })

    expect(result.current.isCancelled).toBe(true)
    expect(result.current.execution.status).toBe(EXECUTION_STATES.CANCELLED)
  })

  it('clears execution state', () => {
    const { result } = renderHook(() =>
      usePersistentExecution({ agent: mockAgent })
    )

    const exec = createPersistentExecution({
      agentId: mockAgent.id,
      steps: [{ id: 'step_1', status: STEP_STATES.COMPLETED }],
    })
    act(() => {
      result.current.setExecution(exec)
    })

    expect(result.current.execution).toBeDefined()

    act(() => {
      result.current.clearExecution()
    })

    expect(result.current.execution).toBeNull()
  })
})
