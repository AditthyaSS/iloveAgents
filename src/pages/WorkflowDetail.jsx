import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Zap,
  Loader2,
  Share2,
  Check,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  GitBranch,
} from 'lucide-react'
import * as Icons from 'lucide-react'
import { loadAllAgents } from '../agents/registry'
import { fetchWorkflowById, subscribeToWorkflow } from '../hooks/useWorkflows'
import { supabase } from '../lib/supabase'
import { useDocumentTitle } from '../lib/useDocumentTitle'

function AgentRow({ agentId, index, total, agents }) {
  const agent = agents?.find((a) => a.id === agentId)
  const IconComponent = (agent && Icons[agent.icon]) || Icons.Bot

  return (
    <div className="flex items-center gap-3">
      {/* Connector line */}
      <div className="flex flex-col items-center self-stretch w-6">
        <div className={`w-px flex-1 dark:bg-border bg-gray-200 ${index === 0 ? 'opacity-0' : ''}`} />
        <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent flex-shrink-0">
          {index + 1}
        </div>
        <div className={`w-px flex-1 dark:bg-border bg-gray-200 ${index === total - 1 ? 'opacity-0' : ''}`} />
      </div>

      {/* Agent card */}
      <div
        className="flex items-center gap-3 flex-1 p-3 rounded-lg border my-1
          dark:bg-surface-card dark:border-border bg-white border-gray-200"
      >
        <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
          <IconComponent size={15} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium dark:text-text-primary text-gray-900 truncate">
            {agent?.name ?? agentId}
          </div>
          <div className="text-[11px] dark:text-text-muted text-gray-400">
            {agent?.category ?? '—'}
          </div>
        </div>
        {index < total - 1 && (
          <ArrowRight size={12} className="dark:text-text-muted text-gray-400 flex-shrink-0" />
        )}
      </div>
    </div>
  )
}

export default function WorkflowDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [agents, setAgents] = useState([])
  useEffect(() => {
    loadAllAgents().then(setAgents)
    .catch(err => console.error(err))