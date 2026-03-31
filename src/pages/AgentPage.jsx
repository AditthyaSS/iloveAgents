import { useParams, Navigate } from 'react-router-dom'
import agents from '../agents/registry'
import AgentRunner from '../components/AgentRunner'

export default function AgentPage() {
  const { id } = useParams()
  const agent = agents.find((a) => a.id === id)

  if (!agent) {
    return <Navigate to="/" replace />
  }

  // Use key to force remount when switching agents
  return <AgentRunner key={agent.id} agent={agent} />
}
