export const RECENT_AGENTS_STORAGE_KEY = 'recentAgents'
export const MAX_RECENT_AGENTS = 5

/**
 * Safely loads recent agent IDs from localStorage.
 * Returns an empty array if data is missing, malformed JSON, or not an array.
 * Sanitizes entries to ensure only non-empty string IDs are returned.
 */
export function loadRecentAgentIds() {
  try {
    const raw = localStorage.getItem(RECENT_AGENTS_STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter((id) => typeof id === 'string' && id.trim().length > 0)
  } catch {
    return []
  }
}

/**
 * Safely updates localStorage with a newly visited agent ID.
 * Deduplicates, puts the newly visited agent at the front, and caps at MAX_RECENT_AGENTS.
 * Catches any storage quota or access errors gracefully.
 */
export function rememberRecentAgent(agentId) {
  if (!agentId || typeof agentId !== 'string') {
    return loadRecentAgentIds()
  }

  const trimmedId = agentId.trim()
  if (!trimmedId) {
    return loadRecentAgentIds()
  }

  const existing = loadRecentAgentIds()
  const updated = [
    trimmedId,
    ...existing.filter((id) => id !== trimmedId),
  ].slice(0, MAX_RECENT_AGENTS)

  try {
    localStorage.setItem(
      RECENT_AGENTS_STORAGE_KEY,
      JSON.stringify(updated)
    )
  } catch {
    // Gracefully ignore storage quota or access errors
  }

  return updated
}
