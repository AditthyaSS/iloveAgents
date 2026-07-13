
import { useState, useCallback, useEffect } from 'react'
 
const STORAGE_KEY = 'ila_ratings'
 
function loadRatings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}
 
function saveRatings(ratings) {
  //localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings))
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings))
   } catch {
    // localStorage can throw in private browsing or when storage quota
    // is full — fail silently rather than breaking the rating flow.
    }
}
 
// Global listeners so multiple components stay in sync
const listeners = new Set()
function notify() {
  listeners.forEach((fn) => fn())
}
 
/**
 * Hook to manage per-agent run ratings (👍/👎), persisted in localStorage.
 * Mirrors the useFavorites.js pattern: all components using this hook
 * stay in sync via a shared listener set.
 *
 * Storage shape: { [agentId]: { up: number, down: number } }
 */
export function useAgentRatings() {
  const [ratings, setRatings] = useState(loadRatings)
 
  // Subscribe to cross-component updates
  useEffect(() => {
    const sync = () => setRatings(loadRatings())
    listeners.add(sync)
    return () => listeners.delete(sync)
  }, [])
 
  /**
   * Record a rating for a given agent.
   * @param {string} agentId
   * @param {'up' | 'down'} value
   */
  const rateAgent = useCallback((agentId, value) => {
    if (!agentId || (value !== 'up' && value !== 'down')) return
 
    const current = loadRatings()
    const existing = current[agentId] || { up: 0, down: 0 }
    const next = {
      ...current,
      [agentId]: {
        ...existing,
        [value]: existing[value] + 1,
      },
    }
    saveRatings(next)
    setRatings(next)
    notify()
  }, [])
 
  /**
   * Get the aggregate rating for a given agent.
   * @param {string} agentId
   * @returns {{ up: number, down: number, total: number, percentage: number | null }}
   */
  const getRating = useCallback(
    (agentId) => {
      const entry = ratings[agentId] || { up: 0, down: 0 }
      const total = entry.up + entry.down
      const percentage = total > 0 ? Math.round((entry.up / total) * 100) : null
      return { up: entry.up, down: entry.down, total, percentage }
    },
    [ratings],
  )
 
  return { ratings, rateAgent, getRating }
}