import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  generateExecutionId,
  isTransientError,
  calculateBackoffDelay,
  createPersistentExecution,
  saveExecution,
  loadExecution,
  loadActiveExecutionForAgent,
  acquireExecutionLock,
  releaseExecutionLock,
  runPersistentExecution,
  EXECUTION_STATES,
  STEP_STATES,
} from './agentExecutionEngine'

describe('agentExecutionEngine', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('generateExecutionId', () => {
    it('generates unique IDs prefixed with agent ID', () => {
      const id1 = generateExecutionId('code-reviewer')
      const id2 = generateExecutionId('code-reviewer')
      expect(id1).toMatch(/^exec_code-reviewer_\d+_[a-z0-9]+$/)
      expect(id2).toMatch(/^exec_code-reviewer_\d+_[a-z0-9]+$/)
      expect(id1).not.toBe(id2)
    })
  })

  describe('isTransientError', () => {
    it('identifies transient errors correctly', () => {
      expect(isTransientError({ status: 429 })).toBe(true)
      expect(isTransientError({ status: 503 })).toBe(true)
      expect(isTransientError({ status: 500 })).toBe(true)
      expect(isTransientError(new Error('Failed to fetch'))).toBe(true)
      expect(isTransientError(new Error('Rate limit exceeded'))).toBe(true)
      expect(isTransientError(new Error('Network timeout'))).toBe(true)
      expect(isTransientError({ isTimeout: true })).toBe(true)
    })

    it('identifies non-transient errors as non-retryable', () => {
      expect(isTransientError({ type: 'invalid_api_key' })).toBe(false)
      expect(isTransientError({ status: 401 })).toBe(false)
      expect(isTransientError({ status: 403 })).toBe(false)
      expect(isTransientError(new Error('Your API key is invalid'))).toBe(false)
      expect(isTransientError({ name: 'AbortError' })).toBe(false)
    })
  })

  describe('calculateBackoffDelay', () => {
    it('computes exponential backoff with configured limits', () => {
      const policy = { initialDelayMs: 500, backoffFactor: 2, maxDelayMs: 4000 }
      const delay0 = calculateBackoffDelay(0, policy)
      const delay1 = calculateBackoffDelay(1, policy)
      const delay2 = calculateBackoffDelay(2, policy)
      const delay5 = calculateBackoffDelay(5, policy)

      expect(delay0).toBeGreaterThanOrEqual(500)
      expect(delay0).toBeLessThanOrEqual(600)

      expect(delay1).toBeGreaterThanOrEqual(1000)
      expect(delay1).toBeLessThanOrEqual(1200)

      expect(delay2).toBeGreaterThanOrEqual(2000)
      expect(delay2).toBeLessThanOrEqual(2400)

      // Capped at maxDelayMs (+ up to 10% jitter)
      expect(delay5).toBeLessThanOrEqual(4400)
    })
  })

  describe('persistence and state management', () => {
    it('creates and persists execution state in storage', () => {
      const execution = createPersistentExecution({
        agentId: 'code-reviewer',
        agentName: 'Code Reviewer',
        inputs: { code: 'console.log(1)' },
        steps: [
          { id: 'step_1', name: 'Step 1' },
          { id: 'step_2', name: 'Step 2' },
        ],
      })

      expect(execution.executionId).toBeDefined()
      expect(execution.status).toBe(EXECUTION_STATES.PENDING)
      expect(execution.steps.length).toBe(2)

      const loaded = loadExecution(execution.executionId)
      expect(loaded).toEqual(execution)
    })

    it('recovers active execution for agent', () => {
      const execution = createPersistentExecution({
        agentId: 'writer-agent',
        agentName: 'Writer Agent',
        inputs: { topic: 'AI' },
        steps: [{ id: 'step_1', name: 'Draft' }],
      })

      execution.status = EXECUTION_STATES.RUNNING
      saveExecution(execution)

      // Simulated page refresh: loadActiveExecutionForAgent detects running run and marks it interrupted
      const recovered = loadActiveExecutionForAgent('writer-agent')
      expect(recovered).toBeDefined()
      expect(recovered.executionId).toBe(execution.executionId)
      expect(recovered.status).toBe(EXECUTION_STATES.INTERRUPTED)
    })
  })

  describe('runPersistentExecution lifecycle & retry', () => {
    it('runs steps sequentially and marks execution completed', async () => {
      const execution = createPersistentExecution({
        agentId: 'test-agent',
        steps: [
          { id: 'step_1', name: 'Step 1' },
          { id: 'step_2', name: 'Step 2' },
        ],
      })

      const step1Spy = vi.fn().mockResolvedValue('Output 1')
      const step2Spy = vi.fn().mockImplementation((input, ctx) => `Output 2 using ${ctx.stepOutputs.step_1}`)

      const result = await runPersistentExecution({
        executionId: execution.executionId,
        stepHandlers: {
          step_1: step1Spy,
          step_2: step2Spy,
        },
      })

      expect(result.status).toBe(EXECUTION_STATES.COMPLETED)
      expect(result.steps[0].status).toBe(STEP_STATES.COMPLETED)
      expect(result.steps[0].output).toBe('Output 1')
      expect(result.steps[1].status).toBe(STEP_STATES.COMPLETED)
      expect(result.steps[1].output).toBe('Output 2 using Output 1')
      expect(step1Spy).toHaveBeenCalledTimes(1)
      expect(step2Spy).toHaveBeenCalledTimes(1)
    })

    it('retries transient errors with exponential backoff and succeeds', async () => {
      const execution = createPersistentExecution({
        agentId: 'test-agent',
        steps: [{ id: 'step_1', name: 'Step 1' }],
        retryPolicy: { maxRetries: 2, initialDelayMs: 10, backoffFactor: 2, maxDelayMs: 50 },
      })

      let calls = 0
      const flakyHandler = vi.fn().mockImplementation(async () => {
        calls++
        if (calls === 1) {
          const err = new Error('Rate limit hit')
          err.status = 429
          throw err
        }
        return 'Recovered success'
      })

      const onRetryCountdown = vi.fn()

      const result = await runPersistentExecution({
        executionId: execution.executionId,
        stepHandlers: { step_1: flakyHandler },
        onRetryCountdown,
      })

      expect(calls).toBe(2)
      expect(result.status).toBe(EXECUTION_STATES.COMPLETED)
      expect(result.steps[0].status).toBe(STEP_STATES.COMPLETED)
      expect(result.steps[0].retryCount).toBe(1)
      expect(result.steps[0].output).toBe('Recovered success')
      expect(onRetryCountdown).toHaveBeenCalled()
    })

    it('fails fast on non-transient errors without retrying', async () => {
      const execution = createPersistentExecution({
        agentId: 'test-agent',
        steps: [{ id: 'step_1', name: 'Step 1' }],
        retryPolicy: { maxRetries: 3, initialDelayMs: 10 },
      })

      let calls = 0
      const invalidKeyHandler = vi.fn().mockImplementation(async () => {
        calls++
        const err = new Error('Invalid API Key')
        err.type = 'invalid_api_key'
        throw err
      })

      await expect(
        runPersistentExecution({
          executionId: execution.executionId,
          stepHandlers: { step_1: invalidKeyHandler },
        })
      ).rejects.toThrow('Invalid API Key')

      expect(calls).toBe(1) // No retries attempted!
      const failed = loadExecution(execution.executionId)
      expect(failed.status).toBe(EXECUTION_STATES.FAILED)
      expect(failed.error.retryable).toBe(false)
    })
  })

  describe('checkpoint recovery & skipping completed steps', () => {
    it('resumes interrupted execution without repeating completed steps', async () => {
      const execution = createPersistentExecution({
        agentId: 'multi-step-agent',
        steps: [
          { id: 'step_1', name: 'Step 1' },
          { id: 'step_2', name: 'Step 2' },
        ],
      })

      // Simulate Step 1 already completed in a previous attempt
      execution.steps[0].status = STEP_STATES.COMPLETED
      execution.steps[0].output = 'Cached result of Step 1'
      execution.status = EXECUTION_STATES.INTERRUPTED
      saveExecution(execution)

      const step1Spy = vi.fn().mockResolvedValue('NEW output 1')
      const step2Spy = vi.fn().mockImplementation((input, ctx) => `Finished with ${ctx.stepOutputs.step_1}`)

      const result = await runPersistentExecution({
        executionId: execution.executionId,
        stepHandlers: {
          step_1: step1Spy,
          step_2: step2Spy,
        },
      })

      // Step 1 was completed, so handler was NOT called again!
      expect(step1Spy).not.toHaveBeenCalled()
      expect(step2Spy).toHaveBeenCalledTimes(1)
      expect(result.status).toBe(EXECUTION_STATES.COMPLETED)
      expect(result.steps[0].output).toBe('Cached result of Step 1')
      expect(result.steps[1].output).toBe('Finished with Cached result of Step 1')
    })
  })

  describe('concurrency lock protection', () => {
    it('prevents duplicate concurrent execution of the same run', async () => {
      const execution = createPersistentExecution({
        agentId: 'test-agent',
        steps: [{ id: 'step_1', name: 'Step 1' }],
      })

      // Acquire lock for runner A
      acquireExecutionLock(execution.executionId, 'runner_A')

      // Runner B attempts to acquire lock on the same execution
      expect(() => {
        acquireExecutionLock(execution.executionId, 'runner_B')
      }).toThrow(/already running in another session/)

      // Release lock for runner A
      releaseExecutionLock(execution.executionId, 'runner_A')

      // Runner B can now acquire lock
      expect(acquireExecutionLock(execution.executionId, 'runner_B')).toBe(true)
    })
  })

  describe('cancellation', () => {
    it('aborts execution when signal is cancelled', async () => {
      const execution = createPersistentExecution({
        agentId: 'test-agent',
        steps: [{ id: 'step_1', name: 'Long running step' }],
      })

      const controller = new AbortController()

      const slowHandler = vi.fn().mockImplementation(async () => {
        controller.abort(new Error('User cancelled run'))
        throw new Error('User cancelled run')
      })

      await expect(
        runPersistentExecution({
          executionId: execution.executionId,
          stepHandlers: { step_1: slowHandler },
          signal: controller.signal,
        })
      ).rejects.toThrow()

      const cancelled = loadExecution(execution.executionId)
      expect(cancelled.status).toBe(EXECUTION_STATES.CANCELLED)
    })
  })
})
