import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GitBranch } from 'lucide-react'
import * as Icons from 'lucide-react'
import { loadAllAgents } from '../agents/registry'

/**
 * Renders "Works well after" clickable pills for agents that define
 * a `suggestedChainFrom` array in their definition.
 *
 * Clicking a pill navigates to /workflows/build with the pair
 * pre-selected via React Router state.
 */
export default function SuggestedChainPills({ agent }) {
  const navigate = useNavigate()
  const [agents, setAgents] = useState([])

  useEffect(() => {
    loadAllAgents().then(setAgents)
  }, [])

  if (!agent.suggestedChainFrom?.length) return null

  const predecessors = agents.length
    ? agent.suggestedChainFrom
        .map((id) => agents.find((a) => a.id === id))
        .filter(Boolean)
    : []

  if (!predecessors.length) return null

  const handlePillClick = (predecessor) => {
    navigate('/workflows/build', {
      state: {
        preselectedAgents: [predecessor.id, agent.id],
      },
    })
  }

  return (
    <div
      className="mb-4 p-3 rounded-lg border
        dark:bg-surface-card dark:border-border bg-white border-gray-200"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <GitBranch size={12} className="text-accent" />
        <span
          className="text-[11px] font-semibold uppercase tracking-wider
            dark:text-text-muted text-gray-400"
        >
          Works well after
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {predecessors.map((pred) => {
          const IconComponent = Icons[pred.icon] || Icons.Bot
          return (
            <button
              key={pred.id}
              onClick={() => handlePillClick(pred)}
              title={`Start a workflow: ${pred.name} → ${agent.name}`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                border transition-all duration-150 active:scale-[0.97]
                dark:bg-surface-input dark:border-border dark:text-text-secondary
                dark:hover:border-accent/50 dark:hover:text-accent
                bg-gray-50 border-gray-200 text-gray-600
                hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
            >
              <IconComponent size={11} />
              {pred.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
