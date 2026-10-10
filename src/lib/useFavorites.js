import { useCallback } from 'react'
import { useSyncedLocalStorage } from './useSyncedLocalStorage'

const STORAGE_KEY = 'ila_favorites'

/**
 * Hook to manage favorite agent IDs, persisted in localStorage.
 * All components using this hook stay in sync via the shared primitive.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useSyncedLocalStorage(STORAGE_KEY, {
    initial: [],
    validate: Array.isArray,
  })

  const isFavorite = useCallback((agentId) => favorites.includes(agentId), [favorites])

  const toggleFavorite = useCallback(
    (agentId) => {
      setFavorites((current) => {
        const list = Array.isArray(current) ? current : []
        return list.includes(agentId) ? list.filter((id) => id !== agentId) : [agentId, ...list]
      })
    },
    [setFavorites]
  )

  return { favorites, isFavorite, toggleFavorite }
}
