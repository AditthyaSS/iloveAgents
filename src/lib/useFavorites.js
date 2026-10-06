import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'ila_favorites'

function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveFavorites(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Storage unavailable (quota exceeded, SecurityError in strict browsers).
    // The in-memory state in the hook remains authoritative — the star toggle
    // still flips; it just won't persist until storage is available again.
  }
}

// Global listeners so multiple components stay in sync
const listeners = new Set()
function notify() {
  listeners.forEach((fn) => fn())
}

/**
 * Hook to manage favorite agent IDs, persisted in localStorage.
 * All components using this hook stay in sync via a shared listener set.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState(loadFavorites)

  // Subscribe to cross-component updates
  useEffect(() => {
    const sync = () => setFavorites(loadFavorites())
    listeners.add(sync)
    return () => listeners.delete(sync)
  }, [])

  const isFavorite = useCallback(
    (agentId) => favorites.includes(agentId),
    [favorites],
  )

  const toggleFavorite = useCallback((agentId) => {
    const current = loadFavorites()
    const next = current.includes(agentId)
      ? current.filter((id) => id !== agentId)
      : [agentId, ...current] // newest favorites first
    saveFavorites(next)
    setFavorites(next)
    notify()
  }, [])

  return { favorites, isFavorite, toggleFavorite }
}
