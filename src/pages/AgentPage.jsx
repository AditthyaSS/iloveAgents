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

  if (isLoading) {
    return (
      <div role="status" aria-label="Loading agent" className="max-w-2xl mx-auto animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-white/10 mb-4" />
        <div className="h-4 w-full rounded bg-gray-200 dark:bg-white/10 mb-2" />
        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-white/10 mb-6" />
        <div className="h-24 w-full rounded-xl bg-gray-200 dark:bg-white/10" />
      </div>
    )
  }

  if (!agent) {
    return <Navigate to="/" replace />
  }

  // Use key to force remount when switching agents
  return <AgentRunner key={agent.id} agent={agent} />
}
