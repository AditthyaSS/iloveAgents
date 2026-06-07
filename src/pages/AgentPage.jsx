import { useState, useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { loadAllAgents } from '../agents/registry'
import AgentRunner from '../components/AgentRunner'
import { useDocumentTitle } from '../lib/useDocumentTitle'

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
    return null
  }

  if (!agent) {
    return <Navigate to="/" replace />
  }

  // Use key to force remount when switching agents
  return <AgentRunner key={agent.id} agent={agent} />
}
