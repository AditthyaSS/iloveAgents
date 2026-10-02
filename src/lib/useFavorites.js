import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'ila_favorites'

function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    // The key is shared with older builds and with whatever the user pastes into
    // the console, so only accept what is actually a list of agent ids.
    return Array.isArray(parsed)
      ? parsed.filter((id) => typeof id === 'string' && id.length > 0)
      : []
  } catch {
    return []
  }
}

/**
 * Persist the favorites list.
 *
 * Favorites are a convenience, not critical data, so a storage failure must not
 * escape into the click handler that triggered it. Browsers reject the write
 * when the origin is over quota (QuotaExceededError) and when storage is
 * blocked outright, for example in Safari private mode (SecurityError).
 *
 * @returns {boolean} true when the value actually reached localStorage.
 */
function saveFavorites(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    return true
  } catch (error) {
    console.warn('Favorites could not be saved to localStorage:', error)
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

  /**
   * Toggle an agent's favorite state.
   * @returns {boolean} whether the new state was written to storage, so callers
   *   that want to warn the user can tell the difference.
   */
  const toggleFavorite = useCallback((agentId) => {
    const current = loadFavorites()
    const next = current.includes(agentId)
      ? current.filter((id) => id !== agentId)
      : [agentId, ...current] // newest favorites first

    if (!saveFavorites(next)) {
      // Nothing was persisted. Re-read what is really stored and let every
      // consumer converge on it, otherwise this component would show a starred
      // agent that quietly disappears on the next reload.
      notify()
      return false
    }

    setFavorites(next)
    notify()
    return true
  }, [])

  return { favorites, isFavorite, toggleFavorite }
}
