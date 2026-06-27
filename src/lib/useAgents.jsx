import { createContext, useContext, useState, useEffect } from 'react'
import { loadAllAgents } from '../agents/registry'

const AgentsContext = createContext(null)

/**
 * Provider that lazy-loads all agent definitions once and
 * makes them available to the entire component tree.
 */
export function AgentsProvider({ children }) {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reloadAgents = () => {
    setLoading(true)
    setError(null)
    loadAllAgents()
      .then((loaded) => {
        setAgents(loaded)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load agents:', err)
        setError(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    reloadAgents()
  }, [])

  return (
    <AgentsContext.Provider value={{ agents, loading, error, reloadAgents }}>
      {children}
    </AgentsContext.Provider>
  )
}

/**
 * Hook to access the lazily-loaded agents list.
 * @returns {{ agents: Array, loading: boolean, error: Error | null, reloadAgents: () => void }}
 */
export function useAgents() {
  const context = useContext(AgentsContext)
  if (!context) {
    throw new Error('useAgents must be used within an AgentsProvider')
  }
  return context
}
