import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'ila_prompt_history'
const MAX_PROMPTS = 100

function loadPrompts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function savePrompts(prompts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts))
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('LocalStorage quota exceeded. Prompt history might be truncated.')
    } else {
      console.error('Error saving prompt history to localStorage:', error)
    }
  }
}

// Global listeners so multiple components (e.g. panel + runner) stay in sync
const listeners = new Set()
function notify() {
  listeners.forEach((fn) => fn())
}

/**
 * Hook to manage a reusable prompt library, independent of any single
 * agent — prompts can be saved while using one agent and reused with
 * another. Persisted in localStorage, capped at 100 entries (oldest
 * non-favorited prompts drop off first).
 */
export function usePromptHistory() {
  const [prompts, setPrompts] = useState(loadPrompts)

  useEffect(() => {
    const sync = () => setPrompts(loadPrompts())
    listeners.add(sync)
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) sync()
    }
    window.addEventListener('storage', handleStorage)
    return () => {
      listeners.delete(sync)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  /**
   * Save a new prompt to history.
   * @param {Object} params
   * @param {string} params.text - The prompt text
   * @param {string} [params.agentId] - Agent it was used/saved from
   * @param {string} [params.agentName] - Display name of that agent
   */
  const savePrompt = useCallback(({ text, agentId, agentName }) => {
    const trimmed = (text || '').trim()
    if (!trimmed) return null

    const current = loadPrompts()

    // Avoid saving an exact duplicate of the most recent entry
    if (current[0]?.text === trimmed) return current[0]

    const entry = {
      id: `prompt_${Date.now()}`,
      text: trimmed,
      agentId: agentId || null,
      agentName: agentName || null,
      favorite: false,
      createdAt: Date.now(),
    }

    let updated = [entry, ...current]

    if (updated.length > MAX_PROMPTS) {
      // Drop the oldest non-favorited entries first to make room
      const favorites = updated.filter((p) => p.favorite)
      const rest = updated.filter((p) => !p.favorite).slice(0, MAX_PROMPTS - favorites.length)
      updated = [...favorites, ...rest].sort((a, b) => b.createdAt - a.createdAt)
    }

    savePrompts(updated)
    setPrompts(updated)
    notify()
    return entry
  }, [])

  const deletePrompt = useCallback((id) => {
    const updated = loadPrompts().filter((p) => p.id !== id)
    savePrompts(updated)
    setPrompts(updated)
    notify()
  }, [])

  const clearHistory = useCallback(() => {
    // Preserve favorites when clearing history
    const favoritesOnly = loadPrompts().filter((p) => p.favorite)
    savePrompts(favoritesOnly)
    setPrompts(favoritesOnly)
    notify()
  }, [])

  const toggleFavorite = useCallback((id) => {
    const updated = loadPrompts().map((p) =>
      p.id === id ? { ...p, favorite: !p.favorite } : p
    )
    savePrompts(updated)
    setPrompts(updated)
    notify()
  }, [])

  const searchPrompts = useCallback(
    (query) => {
      if (!query || !query.trim()) return prompts
      const q = query.trim().toLowerCase()
      return prompts.filter(
        (p) =>
          p.text.toLowerCase().includes(q) ||
          (p.agentName && p.agentName.toLowerCase().includes(q))
      )
    },
    [prompts]
  )

  const favorites = prompts.filter((p) => p.favorite)

  return {
    prompts,
    favorites,
    savePrompt,
    deletePrompt,
    clearHistory,
    toggleFavorite,
    searchPrompts,
  }
}

export default usePromptHistory