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
import agents from '../agents/registry'
import { fetchWorkflows, subscribeToAllWorkflows } from '../hooks/useWorkflows'
import { supabase } from '../lib/supabase'

function AgentPill({ agentId }) {
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

function WorkflowCard({ workflow, onRun, onView }) {
  const [usageCount, setUsageCount] = useState(workflow.usage_count ?? 0)

  // Sync when parent data refreshes
  useEffect(() => {
    setUsageCount(workflow.usage_count ?? 0)
  }, [workflow.usage_count])

  // Per-card realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`workflow-usage-${workflow.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'workflows',
          filter: `id=eq.${workflow.id}`,
        },
        (payload) => {
          setUsageCount(payload.new.usage_count ?? 0)
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [workflow.id])

  return (
    <div
      className="rounded-lg border p-4 transition-all duration-200
        dark:bg-surface-card dark:border-border dark:hover:border-accent/40
        bg-white border-gray-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-accent/5"
    >
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
        <span className="ml-auto text-[11px] dark:text-text-muted text-gray-400">
          {(workflow.agents ?? []).length} agent{workflow.agents?.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}

export default function WorkflowLibrary() {
  const navigate = useNavigate()
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Initial fetch
  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchWorkflows().then(({ data, error: fetchError }) => {
      if (!mounted) return
      if (fetchError) {
        setError('Failed to load workflows. Check your Supabase connection.')
      } else {
        setWorkflows(data)
      }
      setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  // Realtime: update usage counts on any workflow update
  useEffect(() => {
    const channel = subscribeToAllWorkflows((payload) => {
      setWorkflows((prev) =>
        prev.map((w) =>
          w.id === payload.new.id ? { ...w, usage_count: payload.new.usage_count } : w
        )
      )
    })
    return () => supabase.removeChannel(channel)
  }, [])

  const filtered = searchQuery.trim()
    ? workflows.filter((w) =>
        w.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : workflows

  const handleRun = (workflow) => {
    navigate(`/workflows/${workflow.id}/run`, { state: { workflow } })
  }

  const handleView = (workflow) => {
    navigate(`/workflows/${workflow.id}`)
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold dark:text-text-primary text-gray-900 mb-1">
            Workflow Library
          </h1>
          <p className="text-sm dark:text-text-secondary text-gray-500">
            Community-built agent chains. Connect AI and automate your process.
          </p>
        </div>
        <button
          id="build-workflow-btn"
          onClick={() => navigate('/workflows/build')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white
            bg-accent hover:bg-accent-hover transition-all duration-200 active:scale-[0.97]
            shadow-md shadow-accent/20"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Build Workflow</span>
          <span className="sm:hidden">Build</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search size={14} className="dark:text-text-muted text-gray-400" />
        </div>
        <input
          id="workflow-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search workflows..."
          className="w-full pl-9 pr-9 py-2 rounded-lg border text-sm transition-all
            dark:bg-surface-card dark:border-border dark:text-text-primary dark:placeholder-text-muted
            bg-white border-gray-200 text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center
              dark:text-text-muted text-gray-400 hover:text-accent transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={24} className="animate-spin text-accent" />
          <p className="text-sm dark:text-text-secondary text-gray-500">Loading workflows...</p>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-lg border p-6 text-center
          bg-red-500/5 border-red-500/20 animate-fade-in">
          <p className="text-sm text-red-400 mb-3">{error}</p>
          <p className="text-xs dark:text-text-muted text-gray-400">
            Make sure your Supabase credentials are configured in .env.local
          </p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-20 rounded-xl border
          dark:bg-surface-card dark:border-border bg-white border-gray-200 animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <GitBranch size={24} className="text-accent" />
          </div>
          <h3 className="text-sm font-semibold dark:text-text-primary text-gray-900 mb-1">
            {searchQuery ? 'No workflows found' : 'No workflows yet'}
          </h3>
          <p className="text-xs dark:text-text-secondary text-gray-500 mb-4">
            {searchQuery
              ? 'Try a different search term'
              : 'Be the first to build a community workflow'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => navigate('/workflows/build')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white
                bg-accent hover:bg-accent-hover transition-all duration-200"
            >
              <Plus size={14} />
              Build First Workflow
            </button>
          )}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider dark:text-text-muted text-gray-400">
              {searchQuery ? 'Matching Workflows' : 'All Workflows'}
            </h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">
              {filtered.length} {filtered.length === 1 ? 'workflow' : 'workflows'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((workflow, idx) => (
              <div
                key={workflow.id}
                className="animate-fade-in"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <WorkflowCard
                  workflow={workflow}
                  onRun={handleRun}
                  onView={handleView}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
