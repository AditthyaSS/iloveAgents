import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import agents from '../agents/registry'
import AgentRunner from '../components/AgentRunner'

export default function AgentPage() {
  const { id } = useParams()
  const agent = agents.find((a) => a.id === id)

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

  // Use key to force remount when switching agents
  return <AgentRunner key={agent.id} agent={agent} />
}
