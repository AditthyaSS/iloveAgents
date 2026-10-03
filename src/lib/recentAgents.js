/**
 * recentAgents.js - persistence for the "Recently Used Agents" rail.
 *
 * The list is kept in localStorage under `recentAgents` as a JSON array of
 * agent ids. Everything read back from localStorage is untrusted input: a user
 * can paste anything into the console, an older build can leave a truncated
 * value behind, and extensions or other tabs can write to the same origin.
 * A single malformed entry used to take down the whole Home page during render,
 * so every read here degrades to an empty list instead of throwing.
 */

const STORAGE_KEY = 'recentAgents'
const MAX_RECENT = 5

/**
 * Read the recently used agent ids.
 *
 * A stored array can be valid JSON and still not be a valid list: it may hold
 * the same id twice, or more entries than we render. Normalising on read keeps
 * the rail from showing duplicate cards and keeps the cap in one place.
 *
 * @returns {string[]} agent ids, newest first, deduplicated and capped at
 *   MAX_RECENT. Empty when the stored value is absent, unparseable, or not an
 *   array of ids. Ids are compared against `agent.id` (always a string), so
 *   anything else is dropped as well.
 */
export function loadRecentAgentIds() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(stored)) return []

    const ids = []
    const seen = new Set()
    for (const id of stored) {
      if (typeof id !== 'string' || id.length === 0 || seen.has(id)) continue
      seen.add(id)
      ids.push(id)
      if (ids.length === MAX_RECENT) break
    }
    return ids
  } catch {
    // SyntaxError from JSON.parse, or SecurityError when the browser blocks
    // storage access entirely (private mode, third-party cookie settings).
    return []
  }
}

/**
 * Record `agentId` as the most recently used agent, moving it to the front and
 * trimming the list to the five most recent entries.
 *
 * @param {string} agentId
 * @returns {string[]} the persisted list when the write landed, otherwise the
 *   list that is still on disk, so callers never report a change that did not
 *   survive a reload.
 */
export function rememberRecentAgent(agentId) {
  const previous = loadRecentAgentIds()
  const updated = [agentId, ...previous.filter((id) => id !== agentId)].slice(0, MAX_RECENT)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return updated
  } catch {
    return previous
  }
}