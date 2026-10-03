import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import AgentRunner from '../components/AgentRunner'
import { useAgents } from '../lib/useAgents'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { rememberRecentAgent } from '../lib/recentAgents'

export default function AgentPage() {
  const { id } = useParams()
  const { agents, loading: isLoading } = useAgents()

  const agent = agents.find((a) => a.id === id)
  useDocumentTitle(agent?.name ?? 'Agent')

  useEffect(() => {
    if (!agent) return

    rememberRecentAgent(agent.id)
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
