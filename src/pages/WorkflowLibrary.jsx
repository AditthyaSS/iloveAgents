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
  BookOpen,
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
  const handleFork = (workflow) => {
  navigate('/workflows/build', {
    state: {
      forkedWorkflow: workflow,
    },
  })
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
      <div className="relative max-w-md mb-6 group">
        {/* Gradient glow ring — matches navbar/sidebar theme */}
        <div className="pointer-events-none absolute -inset-[1.5px] rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-300
          bg-gradient-to-r from-cyan-400/60 via-indigo-400/60 to-rose-400/60
          dark:from-cyan-500/50 dark:via-indigo-500/50 dark:to-rose-500/50 blur-[2px]" />

        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <Search size={14} className="dark:text-text-muted text-gray-400 group-focus-within:text-accent transition-colors duration-200" />
        </div>
        <input
          id="workflow-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search workflows..."
          className="relative w-full pl-10 pr-10 py-2.5 rounded-full border text-sm transition-all duration-300
            dark:bg-[#101014]/80 dark:border-white/10 dark:text-text-primary dark:placeholder-text-muted
            bg-white/80 border-white/60 text-gray-900 placeholder-gray-400
            backdrop-blur-md
            shadow-[0_4px_20px_rgba(99,102,241,0.08)] dark:shadow-[0_4px_20px_rgba(99,102,241,0.12)]
            focus:outline-none focus:shadow-[0_6px_28px_rgba(99,102,241,0.18)] dark:focus:shadow-[0_6px_28px_rgba(99,102,241,0.22)]
            focus:border-indigo-300/60 dark:focus:border-indigo-500/40"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center z-10
              dark:text-text-muted text-gray-400 hover:text-accent transition-colors duration-200"
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
  <div className="text-center py-20 px-6 rounded-xl border
    dark:bg-surface-card dark:border-border bg-white border-gray-200 animate-fade-in">
    {/* Icon with subtle animation */}
    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mx-auto mb-5">
      <GitBranch size={26} className="text-accent" />
      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent/40 animate-ping" />
    </div>

    {/* Heading + description */}
    <h3 className="text-base font-bold dark:text-text-primary text-gray-900 mb-2">
      {searchQuery ? 'No workflows found' : 'No workflows yet'}
    </h3>
    <p className="text-sm dark:text-text-secondary text-gray-500 mb-6 max-w-md mx-auto leading-relaxed">
      {searchQuery
        ? 'We couldn\'t find any workflows matching your search. Try a different keyword.'
        : 'Be the first to build a community workflow and help others automate their tasks!'}
    </p>

    {/* CTA buttons */}
    <div className="flex flex-wrap items-center justify-center gap-3">
      {!searchQuery && (
        <button
          onClick={() => navigate('/workflows/build')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white
            bg-accent hover:bg-accent-hover transition-all duration-200
            shadow-sm hover:shadow-md hover:shadow-accent/20"
        >
          <Plus size={12} />
          Build First Workflow
        </button>
      )}

      <a
        href="https://github.com/AditthyaSS/iloveAgents#readme"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold
          dark:bg-surface-input dark:hover:bg-surface-hover dark:text-text-secondary
          bg-gray-100 hover:bg-gray-200 text-gray-700
          transition-all duration-200 border dark:border-border border-gray-200"
      >
        <BookOpen size={12} />
        Explore Documentation
      </a>
    </div>
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
                  onFork={handleFork}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
