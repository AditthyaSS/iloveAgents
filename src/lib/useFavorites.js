import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'ila_favorites'

function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveFavorites(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    return true
  } catch {
    return false
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
    const list = Array.isArray(current) ? current : []
    const next = list.includes(agentId)
      ? list.filter((id) => id !== agentId)
      : [agentId, ...list] // newest favorites first
    const saved = saveFavorites(next)
    if (!saved) return
    setFavorites(next)
    notify()
  }, [])

  return { favorites, isFavorite, toggleFavorite }
}
