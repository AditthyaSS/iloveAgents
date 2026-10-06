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
      let existing = []
      try {
        const raw = localStorage.getItem('recentAgents') || '[]'
        const parsed = JSON.parse(raw)
        existing = Array.isArray(parsed) ? parsed : []
      } catch {
        // Malformed data — fall back to empty list
      }

      const updated = [
        agent.id,
        ...existing.filter((item) => item !== agent.id),
      ].slice(0, 5)

      try {
        localStorage.setItem('recentAgents', JSON.stringify(updated))
      } catch {
        // Quota exceeded — prune list and retry
        try {
          localStorage.setItem('recentAgents', JSON.stringify(updated.slice(0, Math.max(1, Math.ceil(updated.length / 2)))))
        } catch {
          // Both attempts failed — storage unavailable
        }
      }
    } catch {
      // Outer guard for any unforeseen error in the tracking effect
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
