/**
 * Agent Execution Engine
 *
 * Provides persistent execution management for long-running AI agent workflows.
 * Features:
 * - Unique execution ID per agent run
 * - Execution state lifecycle: pending, running, completed, failed, cancelled, interrupted
 * - Step-level checkpoints with localStorage persistence
 * - Transient failure classification (network drops, timeouts, 429, 500-504)
 * - Configurable exponential backoff with retry limits
 * - Checkpoint recovery: resumes safely from the first incomplete step
 * - Concurrency lock protection against duplicate concurrent executions
 */

export const EXECUTION_STATES = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  INTERRUPTED: 'interrupted',
}

export const STEP_STATES = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  SKIPPED: 'skipped',
}

export const DEFAULT_RETRY_POLICY = {
  maxRetries: 3,
  initialDelayMs: 1000,
  backoffFactor: 2,
  maxDelayMs: 10000,
  timeoutMs: 45000,
}

const STORAGE_PREFIX = 'ila_exec_'
const INDEX_KEY = 'ila_execution_index'
const LOCK_PREFIX = 'ila_lock_'
const LOCK_TTL_MS = 45000 // 45 seconds TTL
const MAX_INDEXED_EXECUTIONS = 50

/**
 * Generate a cryptographically distinct, chronological execution ID.
 */
export function generateExecutionId(agentId = 'agent') {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  const safeAgent = String(agentId).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20) || 'agent'
  return `exec_${safeAgent}_${timestamp}_${random}`
}

/**
 * Classify whether an error is transient (temporary network/server/rate issue)
 * or non-transient (invalid credentials, bad request, user abort).
 */
export function isTransientError(error) {
  if (!error) return false

  // Explicit non-transient indicators
  if (error.type === 'invalid_api_key' || error.status === 401 || error.status === 403) {
    return false
  }

  // Check error message strings
  const msg = String(error.message || error.detail || error).toLowerCase()
  if (
    msg.includes('invalid_api_key') ||
    msg.includes('api key is invalid') ||
    msg.includes('access forbidden') ||
    msg.includes('unauthorized') ||
    msg.includes('not found')
  ) {
    return false
  }

  // Manual cancellation abort vs timeout abort
  if (error.name === 'AbortError' && !error.isTimeout) {
    return false
  }

  // Transient network, timeout, or server error conditions
  if (
    error.isTimeout ||
    error.name === 'TimeoutError' ||
    error.status === 429 ||
    (typeof error.status === 'number' && error.status >= 500 && error.status <= 504) ||
    msg.includes('rate limit') ||
    msg.includes('too many requests') ||
    msg.includes('failed to fetch') ||
    msg.includes('network') ||
    msg.includes('timeout') ||
    msg.includes('timed out') ||
    msg.includes('service temporarily unavailable') ||
    msg.includes('bad gateway') ||
    msg.includes('gateway timeout') ||
    msg.includes('econnreset') ||
    msg.includes('socket hang up') ||
    msg.includes('fetch failed')
  ) {
    return true
  }

  return false
}

/**
 * Calculate exponential backoff delay in ms with optional jitter.
 */
export function calculateBackoffDelay(attempt, retryPolicy = DEFAULT_RETRY_POLICY) {
  const { initialDelayMs = 1000, backoffFactor = 2, maxDelayMs = 10000 } = retryPolicy
  const exponentialDelay = initialDelayMs * Math.pow(backoffFactor, attempt)
  const cappedDelay = Math.min(exponentialDelay, maxDelayMs)
  // Add small deterministic or pseudo-random jitter (up to 10%)
  const jitter = cappedDelay * 0.1 * (typeof Math.random === 'function' ? Math.random() : 0.05)
  return Math.round(cappedDelay + jitter)
}

/**
 * Helper to safely access localStorage.
 */
function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }
  // Memory storage fallback for headless / non-browser test runs
  if (!globalThis.__ila_mock_storage) {
    const memory = new Map()
    globalThis.__ila_mock_storage = {
      getItem: (k) => memory.get(k) ?? null,
      setItem: (k, v) => memory.set(k, String(v)),
      removeItem: (k) => memory.delete(k),
      clear: () => memory.clear(),
      get length() { return memory.size },
    }
  }
  return globalThis.__ila_mock_storage
}

/**
 * Persist an execution to storage and update the execution index.
 */
export function saveExecution(execution) {
  if (!execution || !execution.executionId) return null
  const storage = getStorage()
  const key = STORAGE_PREFIX + execution.executionId
  const updatedExecution = {
    ...execution,
    updatedAt: new Date().toISOString(),
  }

  try {
    storage.setItem(key, JSON.stringify(updatedExecution))

    // Update the execution index list
    const indexRaw = storage.getItem(INDEX_KEY)
    let index = []
    if (indexRaw) {
      try {
        index = JSON.parse(indexRaw)
      } catch {
        index = []
      }
    }

    // Upsert entry in index
    const summary = {
      executionId: updatedExecution.executionId,
      agentId: updatedExecution.agentId,
      agentName: updatedExecution.agentName,
      status: updatedExecution.status,
      createdAt: updatedExecution.createdAt,
      updatedAt: updatedExecution.updatedAt,
      completedSteps: updatedExecution.steps.filter((s) => s.status === STEP_STATES.COMPLETED).length,
      totalSteps: updatedExecution.steps.length,
    }

    index = [summary, ...index.filter((item) => item.executionId !== updatedExecution.executionId)].slice(
      0,
      MAX_INDEXED_EXECUTIONS
    )
    storage.setItem(INDEX_KEY, JSON.stringify(index))

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(
        new CustomEvent('ila_execution_saved', { detail: updatedExecution })
      )
    }

    return updatedExecution
  } catch (err) {
    console.error('Failed to save execution to storage:', err)
    return updatedExecution
  }
}

/**
 * Load an execution by its executionId.
 */
export function loadExecution(executionId) {
  if (!executionId) return null
  const storage = getStorage()
  const key = STORAGE_PREFIX + executionId
  try {
    const raw = storage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (err) {
    console.error(`Failed to load execution ${executionId}:`, err)
    return null
  }
}

/**
 * Load all execution summaries from the index.
 */
export function loadExecutionIndex() {
  const storage = getStorage()
  try {
    const raw = storage.getItem(INDEX_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Find the most relevant execution for a specific agent:
 * First prioritizes active / recoverable runs (running, pending, interrupted),
 * then falls back to the most recent run for that agent.
 */
export function loadActiveExecutionForAgent(agentId) {
  if (!agentId) return null
  const index = loadExecutionIndex()
  const agentRuns = index.filter((item) => item.agentId === agentId)
  if (agentRuns.length === 0) return null

  // Check for active or interrupted run
  const activeSummary = agentRuns.find(
    (item) =>
      item.status === EXECUTION_STATES.RUNNING ||
      item.status === EXECUTION_STATES.PENDING ||
      item.status === EXECUTION_STATES.INTERRUPTED
  )

  const targetSummary = activeSummary || agentRuns[0]
  const execution = loadExecution(targetSummary.executionId)
  if (!execution) return null

  // If status was 'running' or 'pending' when loaded after a page refresh/crash,
  // classify it as 'interrupted' so the user can review and resume safely.
  if (
    execution.status === EXECUTION_STATES.RUNNING ||
    execution.status === EXECUTION_STATES.PENDING
  ) {
    execution.status = EXECUTION_STATES.INTERRUPTED
    saveExecution(execution)
  }

  return execution
}

/**
 * Delete a saved execution and remove it from the index.
 */
export function deleteExecution(executionId) {
  if (!executionId) return
  const storage = getStorage()
  storage.removeItem(STORAGE_PREFIX + executionId)
  try {
    const index = loadExecutionIndex().filter((item) => item.executionId !== executionId)
    storage.setItem(INDEX_KEY, JSON.stringify(index))
  } catch (err) {
    console.error('Error updating index after deleting execution:', err)
  }
}

/**
 * Clear all executions and indexes.
 */
export function clearAllExecutions() {
  const storage = getStorage()
  const index = loadExecutionIndex()
  index.forEach((item) => {
    storage.removeItem(STORAGE_PREFIX + item.executionId)
  })
  storage.removeItem(INDEX_KEY)
}

/**
 * Concurrency Lock Control
 * Prevents duplicate concurrent execution of the same execution instance.
 */
export function acquireExecutionLock(executionId, runnerId) {
  const storage = getStorage()
  const lockKey = LOCK_PREFIX + executionId
  const now = Date.now()

  try {
    const existingLockRaw = storage.getItem(lockKey)
    if (existingLockRaw) {
      const lockData = JSON.parse(existingLockRaw)
      if (lockData.expiresAt > now && lockData.runnerId !== runnerId) {
        const error = new Error(
          `Execution ${executionId} is already running in another session/tab.`
        )
        error.code = 'CONCURRENT_EXECUTION_BLOCKED'
        throw error
      }
    }

    const newLock = {
      executionId,
      runnerId,
      acquiredAt: now,
      expiresAt: now + LOCK_TTL_MS,
    }
    storage.setItem(lockKey, JSON.stringify(newLock))
    return true
  } catch (err) {
    if (err.code === 'CONCURRENT_EXECUTION_BLOCKED') throw err
    return true
  }
}

/**
 * Renew the concurrency lock heartbeat.
 */
export function renewExecutionLock(executionId, runnerId) {
  const storage = getStorage()
  const lockKey = LOCK_PREFIX + executionId
  const now = Date.now()
  try {
    const lock = {
      executionId,
      runnerId,
      acquiredAt: now,
      expiresAt: now + LOCK_TTL_MS,
    }
    storage.setItem(lockKey, JSON.stringify(lock))
  } catch {
    // ignore
  }
}

/**
 * Release concurrency lock when execution finishes, errors, or cancels.
 */
export function releaseExecutionLock(executionId, runnerId) {
  const storage = getStorage()
  const lockKey = LOCK_PREFIX + executionId
  try {
    const existingLockRaw = storage.getItem(lockKey)
    if (existingLockRaw) {
      const lockData = JSON.parse(existingLockRaw)
      if (!runnerId || lockData.runnerId === runnerId) {
        storage.removeItem(lockKey)
      }
    } else {
      storage.removeItem(lockKey)
    }
  } catch {
    storage.removeItem(lockKey)
  }
}

/**
 * Factory to create a new persistent execution object.
 */
export function createPersistentExecution({
  agentId,
  agentName,
  inputs = {},
  steps = [],
  config = {},
  retryPolicy = DEFAULT_RETRY_POLICY,
}) {
  const executionId = generateExecutionId(agentId)
  const now = new Date().toISOString()

  const formattedSteps = steps.map((s, idx) => ({
    id: s.id || `step_${idx + 1}`,
    name: s.name || `Step ${idx + 1}`,
    type: s.type || 'standard',
    status: STEP_STATES.PENDING,
    input: s.input ?? null,
    output: null,
    error: null,
    retryCount: 0,
    startedAt: null,
    completedAt: null,
    durationMs: 0,
  }))

  const execution = {
    executionId,
    agentId,
    agentName: agentName || agentId,
    status: EXECUTION_STATES.PENDING,
    currentStepIndex: 0,
    steps: formattedSteps,
    inputs: { ...inputs },
    config: { ...config },
    retryPolicy: { ...DEFAULT_RETRY_POLICY, ...retryPolicy },
    retryState: null,
    finalOutput: null,
    durationMs: 0,
    error: null,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  }

  return saveExecution(execution)
}

/**
 * Standard 3-step pipeline template for single-agent execution in Agent Runner:
 * 1. Validation & Prompt Assembly
 * 2. LLM Generation (with streaming, timeout & exponential backoff)
 * 3. Output Finalization & Analytics Recording
 */
export function createAgentRunnerSteps(agent, inputs, customPrompt) {
  return [
    {
      id: 'validate_inputs',
      name: 'Input Validation & Preparation',
      type: 'validation',
      input: { inputs, agentId: agent.id },
    },
    {
      id: 'llm_generate',
      name: 'Agent Model Execution',
      type: 'generation',
      input: {
        agentId: agent.id,
        agentName: agent.name,
        systemPrompt: customPrompt || agent.systemPrompt,
      },
    },
    {
      id: 'finalize_output',
      name: 'Output Processing & Metrics',
      type: 'finalization',
      input: { agentId: agent.id },
    },
  ]
}

/**
 * Abortable sleep utility for backoff timers.
 */
function abortableSleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      return reject(signal.reason || new Error('Execution aborted by user'))
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)

    const onAbort = () => {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
      reject(signal.reason || new Error('Execution aborted by user'))
    }

    signal?.addEventListener('abort', onAbort)
  })
}

/**
 * Step Execution Runner with Timeout and Exponential Backoff.
 * Resumes from persisted checkpoints without repeating completed steps.
 *
 * @param {Object} params
 * @param {string} params.executionId
 * @param {Record<string, Function>} params.stepHandlers - map of stepId -> async (stepInput, context) => stepOutput
 * @param {Function} [params.onProgress] - called whenever execution state updates
 * @param {Function} [params.onRetryCountdown] - called with (attempt, delayMs, error)
 * @param {AbortSignal} [params.signal] - optional cancellation signal
 * @param {string} [params.runnerId] - unique runner session ID
 */
export async function runPersistentExecution({
  executionId,
  stepHandlers,
  onProgress,
  onRetryCountdown,
  signal,
  runnerId = `runner_${Math.random().toString(36).slice(2, 8)}`,
}) {
  let execution = loadExecution(executionId)
  if (!execution) {
    throw new Error(`Execution ${executionId} not found in storage.`)
  }

  // Prevent duplicate concurrent execution of the same run
  acquireExecutionLock(executionId, runnerId)

  // Heartbeat interval for the concurrency lock
  const heartbeatTimer = setInterval(() => {
    renewExecutionLock(executionId, runnerId)
  }, 15000)

  const overallStartTime = performance.now()

  try {
    execution.status = EXECUTION_STATES.RUNNING
    execution.error = null
    execution.retryState = null
    saveExecution(execution)
    onProgress?.(execution)

    // Context shared across steps (includes inputs and checkpointed outputs)
    const context = {
      executionId: execution.executionId,
      agentId: execution.agentId,
      agentName: execution.agentName,
      inputs: { ...execution.inputs },
      config: { ...execution.config },
      stepOutputs: {},
    }

    // Populate context with any previously completed step outputs
    execution.steps.forEach((step) => {
      if (step.status === STEP_STATES.COMPLETED && step.output !== null) {
        context.stepOutputs[step.id] = step.output
      }
    })

    for (let i = 0; i < execution.steps.length; i++) {
      const step = execution.steps[i]
      execution.currentStepIndex = i

      // Check if user cancelled in-flight
      if (signal?.aborted) {
        execution.status = EXECUTION_STATES.CANCELLED
        step.status = STEP_STATES.CANCELLED
        saveExecution(execution)
        onProgress?.(execution)
        throw (signal.reason || new Error('Execution was cancelled'))
      }

      // Checkpoint recovery: Skip already completed steps!
      // "Resume interrupted executions from the last successfully completed step where safe.
      // Prevent duplicate execution of completed steps."
      if (step.status === STEP_STATES.COMPLETED && step.output !== null) {
        context.stepOutputs[step.id] = step.output
        continue
      }

      const handler = stepHandlers[step.id]
      if (!handler) {
        throw new Error(`No handler registered for step "${step.id}"`)
      }

      // Mark step as running
      step.status = STEP_STATES.RUNNING
      step.startedAt = new Date().toISOString()
      step.error = null
      saveExecution(execution)
      onProgress?.(execution)

      const stepStartTime = performance.now()
      let attempt = 0
      let stepSuccess = false
      let lastErr = null

      while (!stepSuccess) {
        // Enforce timeout for the step
        const timeoutMs = execution.retryPolicy.timeoutMs || 45000
        const timeoutController = new AbortController()
        let isTimedOut = false

        const timeoutId = setTimeout(() => {
          isTimedOut = true
          timeoutController.abort(new Error(`Step execution timed out after ${timeoutMs}ms`))
        }, timeoutMs)

        // Combined abort signal: user cancellation + step timeout
        const combinedAbort = (e) => timeoutController.abort(e)
        signal?.addEventListener('abort', combinedAbort)

        try {
          // Execute handler
          const output = await handler(step.input, {
            ...context,
            signal: timeoutController.signal,
          })

          clearTimeout(timeoutId)
          signal?.removeEventListener('abort', combinedAbort)

          // Step succeeded
          step.output = output
          step.status = STEP_STATES.COMPLETED
          step.completedAt = new Date().toISOString()
          step.durationMs = Math.round(performance.now() - stepStartTime)
          step.error = null
          context.stepOutputs[step.id] = output

          execution.retryState = null
          saveExecution(execution)
          onProgress?.(execution)
          stepSuccess = true
        } catch (err) {
          clearTimeout(timeoutId)
          signal?.removeEventListener('abort', combinedAbort)

          if (isTimedOut) {
            err.isTimeout = true
            err.message = `Step execution timed out after ${timeoutMs}ms`
          }

          // If aborted by user, break immediately without retry
          if (signal?.aborted && !isTimedOut) {
            step.status = STEP_STATES.CANCELLED
            execution.status = EXECUTION_STATES.CANCELLED
            saveExecution(execution)
            onProgress?.(execution)
            throw (signal.reason || new Error('Execution was cancelled'))
          }

          lastErr = err
          const transient = isTransientError(err)
          const canRetry = transient && attempt < (execution.retryPolicy.maxRetries ?? 3)

          if (canRetry) {
            attempt++
            const delayMs = calculateBackoffDelay(attempt - 1, execution.retryPolicy)
            step.retryCount = attempt
            execution.retryState = {
              isRetrying: true,
              attempt,
              maxRetries: execution.retryPolicy.maxRetries ?? 3,
              nextRetryDelayMs: delayMs,
              countdownSeconds: Math.ceil(delayMs / 1000),
              lastError: err.message || String(err),
            }

            saveExecution(execution)
            onProgress?.(execution)
            onRetryCountdown?.(attempt, delayMs, err)

            // Wait with backoff delay (abortable by user)
            await abortableSleep(delayMs, signal)
          } else {
            // Permanent failure or retries exhausted
            step.status = STEP_STATES.FAILED
            step.error = {
              message: err.message || String(err),
              type: err.type || (transient ? 'transient_exhausted' : 'permanent_error'),
              detail: err.detail || null,
              retryable: transient,
            }
            step.durationMs = Math.round(performance.now() - stepStartTime)
            step.completedAt = new Date().toISOString()

            execution.status = EXECUTION_STATES.FAILED
            execution.error = step.error
            execution.retryState = null
            saveExecution(execution)
            onProgress?.(execution)
            throw err
          }
        }
      }
    }

    // All steps completed!
    execution.status = EXECUTION_STATES.COMPLETED
    execution.retryState = null
    execution.completedAt = new Date().toISOString()
    execution.durationMs = Math.round(performance.now() - overallStartTime)

    // The final output is typically the output of the generation or finalization step
    const finalStep = execution.steps[execution.steps.length - 1]
    const genStep = execution.steps.find((s) => s.type === 'generation')
    execution.finalOutput = finalStep?.output || genStep?.output || null

    saveExecution(execution)
    onProgress?.(execution)
    return execution
  } catch (err) {
    if (!execution.error && execution.status !== EXECUTION_STATES.CANCELLED) {
      execution.status = EXECUTION_STATES.FAILED
      execution.error = {
        message: err.message || String(err),
        type: err.type || 'execution_error',
      }
      saveExecution(execution)
      onProgress?.(execution)
    }
    throw err
  } finally {
    clearInterval(heartbeatTimer)
    releaseExecutionLock(executionId, runnerId)
  }
}
