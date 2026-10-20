const RECENT_AGENTS_KEY = 'recentAgents'

export function getRecentAgentIds() {
  try {
    const stored = localStorage.getItem(RECENT_AGENTS_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored)
    return Array.isArray(parsed)
      ? parsed.filter((id) => typeof id === 'string')
      : []
  } catch (error) {
    console.warn('Unable to read recent agents from localStorage:', error)
    return []
  }
}

export function saveRecentAgentIds(agentIds) {
  try {
    localStorage.setItem(RECENT_AGENTS_KEY, JSON.stringify(agentIds))
  } catch (error) {
    console.warn('Unable to save recent agents to localStorage:', error)
  }
}
