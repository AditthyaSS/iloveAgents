
const STORAGE_KEY = 'ila_execution_traces'
const MAX_STORED_TRACES = 20

export function createTrace({
  workflowId = null,
  workflowTitle = '',
  agentRunId = null,
} = {}) {
  const startedAt = new Date().toISOString()

  return {
    runId: agentRunId || `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    agentRunId: agentRunId || null,
    workflowId,
    workflowTitle,
    startedAt,
    endedAt: null,
    steps: [],
    finalOutput: null,
    totalDurationMs: 0,
    status: 'running',
  }
}

export function recordStep(trace, step) {
  const now = new Date().toISOString()
  const stepIndex = trace.steps.length

  const startTime = step.startTime || now
  const endTime = step.endTime || now
  const parsedDuration = Number(step.durationMs)
  const durationMs = Number.isFinite(parsedDuration)
    ? Math.max(0, Math.round(parsedDuration))
    : Math.max(0, new Date(endTime).getTime() - new Date(startTime).getTime())

  const statusMap = {
    done: 'success',
    failed: 'error',
    skipped: 'skipped',
    success: 'success',
    error: 'error',
  }

  trace.steps.push({
    stepIndex,
    stepName: step.stepName || step.toolName || `Step ${stepIndex + 1}`,
    stepType: step.stepType || 'agent',
    toolName: step.toolName || null,
    input: truncateForStorage(step.input),
    output: truncateForStorage(step.output),
    startTime,
    endTime,
    durationMs,
    status: statusMap[step.status] || step.status || 'success',
    errorMessage: step.errorMessage ?? step.error ?? null,
    // Keep the legacy field so the existing TraceViewer still displays errors.
    error: step.errorMessage ?? step.error ?? null,
  })

  return trace
}

export function finalizeTrace(trace, { status, finalOutput = null } = {}) {
  trace.endedAt = new Date().toISOString()
  trace.totalDurationMs = Math.max(
    0,
    new Date(trace.endedAt).getTime() - new Date(trace.startedAt).getTime(),
  )
  trace.status =
    status === 'failed' ? 'error' :
    status === 'done' ? 'success' :
    status || 'success'
  trace.finalOutput = truncateForStorage(finalOutput)

  persistTrace(trace)
  return trace
}

export function loadTraces() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function getTraceByRunId(runId) {
  return loadTraces().find((trace) => trace.runId === runId) || null
}

export function clearTraces() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage may be unavailable.
  }
}

export function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) return '0ms'
  if (ms < 1000) return `${Math.round(ms)}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`
}

function persistTrace(trace) {
  try {
    const traces = loadTraces().filter((item) => item.runId !== trace.runId)
    traces.unshift(trace)
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(traces.slice(0, MAX_STORED_TRACES)),
    )
  } catch {
    // Quota exceeded or storage unavailable.
  }
}

function truncateForStorage(value, limit = 8000) {
  if (value == null) return null

  const str = typeof value === 'string' ? value : JSON.stringify(value)
  return str.length > limit
    ? `${str.slice(0, limit)}\n... [truncated]`
    : str
}
