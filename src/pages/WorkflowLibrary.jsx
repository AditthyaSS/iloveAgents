import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Zap,
  Eye,
  ArrowRight,
  GitBranch,
  Loader2,
  TrendingUp,
  X,
} from 'lucide-react'
import { useAgents } from '../lib/useAgents'
import { fetchWorkflows, subscribeToAllWorkflows } from '../hooks/useWorkflows'
import { supabase } from '../lib/supabase'
import { useDocumentTitle } from '../lib/useDocumentTitle'

function AgentPill({ agentId }) {
  const { agents } = useAgents()
  const agent = agents.find((a) => a.id === agentId)
  if (!agent) return <span className="text-[11px] dark:text-text-muted text-gray-400">{agentId}</span>
  return (
    <span
      className="text-[11px] font-medium px-2 py-0.5 rounded-md
        dark:bg-surface-input dark:text-text-secondary dark:border-border
        bg-gray-100 text-gray-600 border border-gray-200"
    >
      {agent.name}
    </span>
  )
}

function WorkflowCard({ workflow, onRun, onView, onFork }) {
  const usageCount = workflow.usage_count ?? 0

  return (
    <div
      className="group relative rounded-lg border p-4 transition-all duration-300 overflow-hidden
        dark:bg-surface-card dark:border-border
        bg-white border-gray-200
        hover:border-indigo-300/60 dark:hover:border-indigo-500/40
        hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/15
        hover:-translate-y-0.5"
    >
      {/* Hover gradient overlay — signature cyan→indigo→rose theme */}
      <div className="pointer-events-none absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300
        bg-gradient-to-br from-cyan-400/8 via-indigo-400/8 to-rose-400/8
        dark:from-cyan-500/10 dark:via-indigo-500/10 dark:to-rose-500/10" />
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
            <GitBranch size={17} className="text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold dark:text-text-primary text-gray-900 line-clamp-1">
              {workflow.title}
            </h3>
            {workflow.description && (
              <p className="text-[11px] dark:text-text-secondary text-gray-500 line-clamp-1 mt-0.5">
                {workflow.description}
              </p>
            )}
          </div>
        </div>
        {/* Usage Count */}
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <TrendingUp size={11} className="dark:text-text-muted text-gray-400" />
          <span className="text-[11px] font-medium dark:text-text-muted text-gray-400">
            {usageCount}
          </span>
        </div>
      </div>

      {/* Agent Sequence */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {(workflow.agents ?? []).map((agentId, index) => (
          <span key={agentId + index} className="flex items-center gap-1">
            <AgentPill agentId={agentId} />
            {index < workflow.agents.length - 1 && (
              <ArrowRight size={10} className="dark:text-text-muted text-gray-400 flex-shrink-0" />
            )}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          id={`run-workflow-${workflow.id}`}
          onClick={() => onRun(workflow)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white
            bg-accent hover:bg-accent-hover transition-all duration-200 active:scale-[0.97]"
        >
          <Zap size={12} />
          Run
        </button>
        <button
          id={`view-workflow-${workflow.id}`}
          onClick={() => onView(workflow)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
            dark:bg-surface-input dark:border-border dark:text-text-secondary dark:hover:text-text-primary
            bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900"
        >
          <Eye size={12} />
          Details
        </button>
        <button
  id={`fork-workflow-${workflow.id}`}
  onClick={() => onFork(workflow)}
  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
    dark:bg-surface-input dark:border-border dark:text-text-secondary dark:hover:text-text-primary
    bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900"
>
  <GitBranch size={12} />
  Fork
</button>
        <span className="ml-auto text-[11px] dark:text-text-muted text-gray-400">
          {(workflow.agents ?? []).length} agent{workflow.agents?.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}

export default function WorkflowLibrary() {
  const navigate = useNavigate()
  useDocumentTitle('Workflow Library')
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Initial fetch
  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchWorkflows().then(({ data, error: fetchError }) => {
    .catch(err => console.error(err))