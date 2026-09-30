import { useState, useEffect, useRef, useCallback } from 'react'
import {
  createPersistentExecution,
  createAgentRunnerSteps,
  runPersistentExecution,
  loadExecution,
  loadActiveExecutionForAgent,
  saveExecution,
  EXECUTION_STATES,
  STEP_STATES,
  DEFAULT_RETRY_POLICY,
} from '../lib/agentExecutionEngine'
import { streamAgent } from '../lib/llmAdapter'
import { resolveAgentModel } from '../lib/resolveAgentModel'
import { recordAnalyticsRun } from '../lib/useAnalytics'

/**
 * Custom hook to manage persistent agent executions, recovery, and retries.
 *
 * @param {Object} options
 * @param {Object} options.agent - Agent definition object
 * @param {Function} [options.onComplete] - Callback when execution completes successfully
 * @param {Function} [options.onSaveRun] - Callback to save run to history
 * @param {Function} [options.onAddSpend] - Callback to record session spend
 */
export function usePersistentExecution({ agent, onComplete, onSaveRun, onAddSpend }) {
  const [execution, setExecution] = useState(null)
  const [streamingOutput, setStreamingOutput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [retryCountdown, setRetryCountdown] = useState(null)
  const [retryPolicy, setRetryPolicy] = useState(DEFAULT_RETRY_POLICY)

  const abortControllerRef = useRef(null)
  const countdownTimerRef = useRef(null)
  const runnerIdRef = useRef(`runner_${Math.random().toString(36).slice(2, 9)}`)

  // Restore execution state on mount or when agent changes
  useEffect(() => {
    if (!agent?.id) return

    // Clean up any ongoing execution controllers
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
    }

    setStreamingOutput('')
    setIsStreaming(false)
    setRetryCountdown(null)

    // Check if there is an active, interrupted, or recent execution in storage
    const active = loadActiveExecutionForAgent(agent.id)
    if (active) {
      setExecution(active)
      if (active.retryPolicy) {
        setRetryPolicy(active.retryPolicy)
      }
      // If completed with finalOutput, make sure it is accessible
      if (active.status === EXECUTION_STATES.COMPLETED && active.finalOutput) {
        onComplete?.(active.finalOutput, active.durationMs)
      }
    } else {
      setExecution(null)
    }
  }, [agent?.id])

  // Clear countdown timer when unmounting or execution status changes
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current)
      }
    }
  }, [])

  /**
   * Helper to build default step handlers for an agent run
   */
  const buildDefaultStepHandlers = useCallback(
    ({
      agentDef,
      inputs,
      provider,
      selectedModel,
      apiKey,
      customPrompt,
      buildUserMessageFn,
    }) => {
      return {
        // Step 1: Input Validation & Preparation
        validate_inputs: async () => {
          const missing = (agentDef.inputs || [])
            .filter((i) => i.required)
            .filter((i) => {
              const v = inputs[i.id]
              if (Array.isArray(v)) return v.length === 0
              return !v || String(v).trim() === ''
            })

          if (missing.length > 0) {
            const fieldNames = missing.map((m) => m.label || m.id).join(', ')
            const err = new Error(`Missing required fields: ${fieldNames}`)
            err.type = 'validation_error'
            throw err
          }

          if (!apiKey || String(apiKey).trim() === '') {
            const err = new Error('Please provide an API key to run this agent.')
            err.type = 'invalid_api_key'
            throw err
          }

          const userMessage = buildUserMessageFn
            ? buildUserMessageFn()
            : Object.entries(inputs)
                .map(([k, v]) => `${k}: ${v}`)
                .join('\n\n')

          return {
            prepared: true,
            userMessage,
            systemPrompt: customPrompt || agentDef.systemPrompt,
            provider,
            model: resolveAgentModel(agentDef, provider, selectedModel),
          }
        },

        // Step 2: Agent Model Generation (with streaming & transient retry)
        llm_generate: async (_stepInput, context) => {
          setStreamingOutput('')
          setIsStreaming(true)

          const valOutput = context.stepOutputs?.validate_inputs || {}
          const userMessage = valOutput.userMessage || ''
          const systemPrompt = valOutput.systemPrompt || customPrompt || agentDef.systemPrompt
          const actualProvider = valOutput.provider || provider
          const model = valOutput.model || resolveAgentModel(agentDef, actualProvider, selectedModel)

          try {
            const result = await streamAgent({
              provider: actualProvider,
              model,
              apiKey,
              systemPrompt,
              userMessage,
              onChunk: (chunk) => {
                setStreamingOutput((prev) => prev + chunk)
              },
              signal: context.signal,
            })

            setIsStreaming(false)
            setStreamingOutput('')
            return result.content
          } catch (err) {
            setIsStreaming(false)
            throw err
          }
        },

        // Step 3: Output Processing & Analytics Recording
        finalize_output: async (_stepInput, context) => {
          const generatedContent = context.stepOutputs?.llm_generate || ''
          const valOutput = context.stepOutputs?.validate_inputs || {}
          const userMessage = valOutput.userMessage || ''
          const systemPrompt = valOutput.systemPrompt || customPrompt || agentDef.systemPrompt
          const actualProvider = valOutput.provider || provider
          const model = valOutput.model || resolveAgentModel(agentDef, actualProvider, selectedModel)

          // Estimate token usage
          const inputTokenEstimate = Math.max(
            1,
            Math.round(((systemPrompt?.length || 0) + (userMessage?.length || 0)) / 4)
          )
          const outputTokenEstimate = Math.max(1, Math.round(generatedContent.length / 4))

          // Record metrics
          if (onAddSpend) {
            onAddSpend({
              model,
              inputTokens: inputTokenEstimate,
              outputTokens: outputTokenEstimate,
              inputCost: null,
              outputCost: null,
            })
          }

          if (onSaveRun) {
            onSaveRun({
              agentId: agentDef.id,
              agentName: agentDef.name,
              inputs: { ...inputs },
              output: generatedContent,
              provider: actualProvider,
            })
          }

          recordAnalyticsRun({
            agentId: agentDef.id,
            agentName: agentDef.name,
            category: agentDef.category,
            provider: actualProvider,
            model,
            duration: context.durationMs || 0,
          })

          return {
            content: generatedContent,
            inputTokens: inputTokenEstimate,
            outputTokens: outputTokenEstimate,
          }
        },
      }
    },
    [onAddSpend, onSaveRun]
  )

  /**
   * Internal runner logic for executing or resuming an execution.
   */
  const executeWithEngine = useCallback(
    async (execId, handlers) => {
      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        const finishedExec = await runPersistentExecution({
          executionId: execId,
          stepHandlers: handlers,
          signal: controller.signal,
          runnerId: runnerIdRef.current,
          onProgress: (updated) => {
            setExecution({ ...updated })
          },
          onRetryCountdown: (attempt, delayMs) => {
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
            let remaining = Math.ceil(delayMs / 1000)
            setRetryCountdown(remaining)

            countdownTimerRef.current = setInterval(() => {
              remaining -= 1
              if (remaining <= 0) {
                clearInterval(countdownTimerRef.current)
                setRetryCountdown(null)
              } else {
                setRetryCountdown(remaining)
              }
            }, 1000)
          },
        })

        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
        setRetryCountdown(null)
        setExecution({ ...finishedExec })

        const finalContent =
          finishedExec.finalOutput?.content ||
          finishedExec.finalOutput ||
          finishedExec.steps.find((s) => s.id === 'llm_generate')?.output ||
          ''

        onComplete?.(finalContent, finishedExec.durationMs)
        return finishedExec
      } catch (err) {
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
        setRetryCountdown(null)
        const reloaded = loadExecution(execId)
        if (reloaded) setExecution(reloaded)
        throw err
      } finally {
        abortControllerRef.current = null
      }
    },
    [onComplete]
  )

  /**
   * Start a new persistent execution
   */
  const startExecution = useCallback(
    async ({
      agentDef,
      inputs,
      provider,
      selectedModel,
      apiKey,
      customPrompt,
      buildUserMessageFn,
      customSteps,
      customHandlers,
    }) => {
      const stepsToRun =
        customSteps || createAgentRunnerSteps(agentDef, inputs, customPrompt)

      const newExecution = createPersistentExecution({
        agentId: agentDef.id,
        agentName: agentDef.name,
        inputs,
        steps: stepsToRun,
        config: {
          provider,
          selectedModel,
          customPrompt,
        },
        retryPolicy,
      })

      setExecution(newExecution)

      const handlers =
        customHandlers ||
        buildDefaultStepHandlers({
          agentDef,
          inputs,
          provider,
          selectedModel,
          apiKey,
          customPrompt,
          buildUserMessageFn,
        })

      return executeWithEngine(newExecution.executionId, handlers)
    },
    [retryPolicy, buildDefaultStepHandlers, executeWithEngine]
  )

  /**
   * Resume an interrupted or failed execution from the last saved checkpoint
   */
  const resumeExecution = useCallback(
    async ({
      agentDef,
      inputs,
      provider,
      selectedModel,
      apiKey,
      customPrompt,
      buildUserMessageFn,
      customHandlers,
    }) => {
      if (!execution?.executionId) return

      const handlers =
        customHandlers ||
        buildDefaultStepHandlers({
          agentDef: agentDef || agent,
          inputs: inputs || execution.inputs,
          provider: provider || execution.config?.provider,
          selectedModel: selectedModel || execution.config?.selectedModel,
          apiKey,
          customPrompt: customPrompt || execution.config?.customPrompt,
          buildUserMessageFn,
        })

      return executeWithEngine(execution.executionId, handlers)
    },
    [execution, agent, buildDefaultStepHandlers, executeWithEngine]
  )

  /**
   * Retry a failed execution step
   */
  const retryExecution = useCallback(
    async (params) => {
      if (!execution) return
      // Reset failed steps to pending before restarting
      const updated = {
        ...execution,
        status: EXECUTION_STATES.RUNNING,
        steps: execution.steps.map((s) =>
          s.status === STEP_STATES.FAILED
            ? { ...s, status: STEP_STATES.PENDING, error: null, retryCount: 0 }
            : s
        ),
        error: null,
      }
      saveExecution(updated)
      setExecution(updated)
      return resumeExecution(params)
    },
    [execution, resumeExecution]
  )

  /**
   * Cancel an in-flight execution
   */
  const cancelExecution = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(new Error('Execution cancelled by user'))
      abortControllerRef.current = null
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
      setRetryCountdown(null)
    }
    if (execution) {
      const updated = {
        ...execution,
        status: EXECUTION_STATES.CANCELLED,
        steps: execution.steps.map((s) =>
          s.status === STEP_STATES.RUNNING
            ? { ...s, status: STEP_STATES.CANCELLED }
            : s
        ),
      }
      saveExecution(updated)
      setExecution(updated)
    }
    setIsStreaming(false)
  }, [execution])

  /**
   * Dismiss the current execution to start a fresh run
   */
  const clearExecution = useCallback(() => {
    cancelExecution()
    setExecution(null)
    setStreamingOutput('')
    setIsStreaming(false)
    setRetryCountdown(null)
  }, [cancelExecution])

  // Computed status flags
  const isRunning = execution?.status === EXECUTION_STATES.RUNNING
  const isInterrupted = execution?.status === EXECUTION_STATES.INTERRUPTED
  const isFailed = execution?.status === EXECUTION_STATES.FAILED
  const isCompleted = execution?.status === EXECUTION_STATES.COMPLETED
  const isCancelled = execution?.status === EXECUTION_STATES.CANCELLED
  const isRetrying = Boolean(execution?.retryState?.isRetrying)

  const completedStepsCount =
    execution?.steps?.filter((s) => s.status === STEP_STATES.COMPLETED).length || 0
  const totalStepsCount = execution?.steps?.length || 1
  const progressPercent = Math.round((completedStepsCount / totalStepsCount) * 100)

  return {
    execution,
    setExecution,
    isRunning,
    isInterrupted,
    isFailed,
    isCompleted,
    isCancelled,
    isRetrying,
    retryCountdown,
    retryPolicy,
    setRetryPolicy,
    progressPercent,
    streamingOutput,
    isStreaming,
    startExecution,
    resumeExecution,
    retryExecution,
    cancelExecution,
    clearExecution,
  }
}

export default usePersistentExecution
