/**
 * useRecentAgents — tracks the last N distinct agents the user has run.
 *
 * Piggybacks on the iloveAgents_history key written by useHistory so no
 * separate storage is needed. Derives a deduplicated, newest-first list
 * of agent ids/names for the "Recently Used" homepage section.
 */
import { useState, useEffect, useCallback } from 'react'

const HISTORY_KEY = 'iloveAgents_history'
const MAX_RECENT = 8

function getRecentFromHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const runs = JSON.parse(raw)
    if (!Array.isArray(runs)) return []

    // Deduplicate by agentId, keeping the most recent run per agent
    const seen = new Set()
    return runs
      .filter((run) => run?.agentId && !seen.has(run.agentId) && seen.add(run.agentId))
      .slice(0, MAX_RECENT)
      .map((run) => ({
        id: run.agentId,
        name: run.agentName || run.agentId,
        category: run.agentCategory || run.category || '',
        lastUsedAt: run.timestamp,
      }))
  } catch {
    return []
  }
}

export function useRecentAgents() {
  const [recentAgents, setRecentAgents] = useState(getRecentFromHistory)

  // Keep in sync with writes from other tabs or concurrent runs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === HISTORY_KEY) {
        setRecentAgents(getRecentFromHistory())
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(HISTORY_KEY)
    } catch {
      // storage unavailable — reset in-memory state regardless
    }
    setRecentAgents([])
  }, [])

  return { recentAgents, clearHistory }
}
