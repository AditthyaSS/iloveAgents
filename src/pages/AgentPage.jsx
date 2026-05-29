import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import agents from '../agents/registry'
import AgentRunner from '../components/AgentRunner'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import ErrorBoundary from '../components/ErrorBoundary'

export default function AgentPage() {
  const { id } = useParams()
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

  if (!agent) {
    return <Navigate to="/" replace />
  }
  // Key is moved to the ErrorBoundary so it resets if the user switches agents.
  return (
    <ErrorBoundary key={agent.id}>
      <AgentRunner agent={agent} />
    </ErrorBoundary>
  )
}}
