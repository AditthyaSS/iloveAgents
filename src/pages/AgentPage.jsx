import { useState, useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { loadAllAgents } from '../agents/registry'
import AgentRunner from '../components/AgentRunner'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { rememberRecentAgent } from '../lib/recentAgents'

export default function AgentPage() {
  const { id } = useParams()
  const [agents, setAgents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAllAgents().then((loaded) => {
      setAgents(loaded)
      setIsLoading(false)
    })
  }, [])

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
