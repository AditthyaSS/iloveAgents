// Timeout helpers for agent runs.
//
// Default is 5 minutes. Override globally with
// VITE_AGENT_DEFAULT_TIMEOUT_SECONDS, or per agent with
// timeoutSeconds / maxExecutionSeconds on the agent definition.

export const DEFAULT_TIMEOUT_MS = 300000
export const DEFAULT_TOOL_TIMEOUT_MS = 30000
export const DEFAULT_MAX_TOOL_ROUNDS = 20

export function getAgentTimeoutMs(agent) {
  const fromAgent =
    agent?.timeoutSeconds ?? agent?.maxExecutionSeconds ?? agent?.max_execution_seconds
  if (Number.isFinite(Number(fromAgent)) && Number(fromAgent) > 0) {
    return Number(fromAgent) * 1000
  }
  try {
    const envVal = import.meta?.env?.VITE_AGENT_DEFAULT_TIMEOUT_SECONDS
    if (Number.isFinite(Number(envVal)) && Number(envVal) > 0) {
      return Number(envVal) * 1000
    }
  } catch {
    // ignore env access outside vite
  }
  return DEFAULT_TIMEOUT_MS
}

export function timeoutMessage(ms) {
  const secs = Math.round(ms / 1000)
  return `Agent execution exceeded ${secs}s limit. Partial output is shown above.`
}
