const STORAGE_KEY = 'recentAgents'
export const MAX_RECENT_AGENTS = 5

function isQuotaError(error) {
  return (
    error &&
    (error.name === 'QuotaExceededError' || error.code === 22 || error.code === 1014)
  )
}

export function loadRecentIds(storage) {
  const source = storage || localStorage
  try {
    const raw = source.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id) => typeof id === 'string' && id.trim())
  } catch {
    return []
  }
}

function writeIds(ids, storage) {
  const target = storage || localStorage
  let list = Array.isArray(ids) ? [...ids] : []
  for (;;) {
    try {
      target.setItem(STORAGE_KEY, JSON.stringify(list))
      return list
    } catch (error) {
      if (!isQuotaError(error) || list.length <= 1) {
        return list
      }
      list = list.slice(0, Math.max(1, list.length - 2))
    }
  }
}

export function recordRecentVisit(agentId, storage) {
  if (!agentId || typeof agentId !== 'string') return loadRecentIds(storage)
  const updated = [agentId, ...loadRecentIds(storage).filter((id) => id !== agentId)].slice(
    0,
    MAX_RECENT_AGENTS
  )
  return writeIds(updated, storage)
}
