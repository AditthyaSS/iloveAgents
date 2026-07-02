const STORAGE_KEY = 'ila_execution_traces'
const MAX_STORED_TRACES = 20

/**
 * Create a new execution trace for a workflow run.
 * @param {{ workflowId?: string, workflowTitle?: string }} meta
 * @returns {object} trace
 */
export function createTrace({ workflowId = null, workflowTitle = '' } = {}) {
  return {
    runId: `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    workflowId,
    workflowTitle,
    startedAt: new Date().toISOString(),
    endedAt: null,
    steps: [],
    finalOutput: null,
    status: 'running',
  }
}

/**
 * Append a completed step record to a trace. Mutates and returns the trace.
 * @param {object} trace
 * @param {{ stepName: string, stepType: string, input: string, output: string|null, durationMs: number, status: 'done'|'failed', error?: string|null }} step
 * @returns {object} trace
 */
export function recordStep(trace, step) {
  trace.steps.push({
    stepName: step.stepName,
    stepType: step.stepType || 'agent',
    input: truncateForStorage(step.input),
    output: truncateForStorage(step.output),
    durationMs: Math.round(step.durationMs),
    status: step.status,
    error: step.error ?? null,
  })
  return trace
}

/**
 * Mark a trace as finished and persist it to localStorage.
 * @param {object} trace
 * @param {{ status: 'done'|'failed', finalOutput?: string|null }} result
 * @returns {object} trace
 */
export function finalizeTrace(trace, { status, finalOutput = null }) {
  trace.endedAt = new Date().toISOString()
  trace.status = status
  trace.finalOutput = truncateForStorage(finalOutput)
  persistTrace(trace)
  return trace
}

/**
 * Load stored traces, newest first. Returns [] when storage is empty or corrupt.
 * @returns {Array<object>}
 */
export function loadTraces() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Remove all stored traces.
 */
export function clearTraces() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // storage unavailable; nothing to clear
  }
}

/**
 * Format a millisecond duration as a compact human-readable badge label.
 * @param {number} ms
 * @returns {string}
 */
export function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) return '0ms'
  if (ms < 1000) return `${Math.round(ms)}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`
}

function persistTrace(trace) {
  try {
    const traces = loadTraces()
    traces.unshift(trace)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(traces.slice(0, MAX_STORED_TRACES)))
  } catch {
    // Quota exceeded or storage unavailable; the in-memory trace still renders
  }
}

// Keep individual payloads bounded so a handful of runs cannot exhaust localStorage
function truncateForStorage(value, limit = 8000) {
  if (value == null) return null
  const str = String(value)
  return str.length > limit ? `${str.slice(0, limit)}\n... [truncated]` : str
}
