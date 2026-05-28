import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useAgents } from '../lib/useAgents'
import AgentRunner from '../components/AgentRunner'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export default function AgentPage() {
  const { id } = useParams()
  const { agents, loading } = useAgents()
  const agent = agents.find((a) => a.id === id)
  useDocumentTitle(agent?.name ?? 'Agent')

  useEffect(() => {
    if (!agent) return

    const existing = JSON.parse(
      localStorage.getItem('recentAgents') || '[]'
    )

    const updated = [
      agent.id,
      ...existing.filter((item) => item !== agent.id),
    ].slice(0, 5)

    localStorage.setItem(
      'recentAgents',
      JSON.stringify(updated)
    )
  }, [agent])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    )
  }

  if (!agent) {
    return <Navigate to="/" replace />
  }

  // Use key to force remount when switching agents
  return <AgentRunner key={agent.id} agent={agent} />
}
