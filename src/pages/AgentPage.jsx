import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import AgentRunner from '../components/AgentRunner'
import { useAgents } from '../lib/useAgents'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export default function AgentPage() {
  const { id } = useParams()
  const { agents, loading: isLoading } = useAgents()

  const agent = agents.find((a) => a.id === id)
  useDocumentTitle(agent?.name ?? 'Agent')

  useEffect(() => {
    if (!agent) return

    try {
      const raw = localStorage.getItem('recentAgents')
      const existing = raw ? JSON.parse(raw) : []
      const list = Array.isArray(existing) ? existing : []

      const updated = [
        agent.id,
        ...list.filter((item) => item !== agent.id),
      ].slice(0, 5)

      localStorage.setItem(
        'recentAgents',
        JSON.stringify(updated)
      )
    } catch {
      // storage unavailable, corrupt, or quota exceeded
    }
  }, [agent])

  if (isLoading) {
    return null
  }

  if (!agent) {
    return <Navigate to="/" replace />
  }

  // Use key to force remount when switching agents
  return <AgentRunner key={agent.id} agent={agent} />
}
