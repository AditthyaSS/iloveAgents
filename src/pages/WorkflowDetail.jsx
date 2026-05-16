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
import agents from '../agents/registry'
import { fetchWorkflowById, subscribeToWorkflow } from '../hooks/useWorkflows'
import { supabase } from '../lib/supabase'

function AgentRow({ agentId, index, total }) {
  const agent = agents.find((a) => a.id === agentId)
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

  const [workflow, setWorkflow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [usageCount, setUsageCount] = useState(0)
  const [copied, setCopied] = useState(false)

  // Fetch workflow
  useEffect(() => {
    let mounted = true
    fetchWorkflowById(id).then(({ data, error: fetchError }) => {
      if (!mounted) return
      if (fetchError || !data) {
        setError('Workflow not found.')
      } else {
        setWorkflow(data)
        setUsageCount(data.usage_count ?? 0)
      }
      setLoading(false)
    })
    return () => { mounted = false }
  }, [id])

  // Realtime usage count subscription
  useEffect(() => {
    if (!id) return
    const channel = subscribeToWorkflow(id, (payload) => {
      setUsageCount(payload.new.usage_count ?? 0)
    })
    return () => supabase.removeChannel(channel)
  }, [id])

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRun = () => {
    navigate(`/workflows/${id}/run`, { state: { workflow } })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 animate-fade-in">
        <Loader2 size={24} className="animate-spin text-accent" />
        <p className="text-sm dark:text-text-secondary text-gray-500">Loading workflow...</p>
      </div>
    )
  }

  if (error || !workflow) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 animate-fade-in">
        <AlertCircle size={28} className="text-red-400 mx-auto mb-3" />
        <p className="text-sm dark:text-text-secondary text-gray-500 mb-4">
          {error ?? 'Workflow not found.'}
        </p>
        <button
          onClick={() => navigate('/workflows')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
        >
          <ArrowLeft size={14} /> Back to Library
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate('/workflows')}
        className="inline-flex items-center gap-1.5 mb-5 text-xs dark:text-text-muted text-gray-400 hover:underline"
      >
        <ArrowLeft size={13} />
        Workflow Library
      </button>

      {/* Header Card */}
      <div
        className="rounded-xl border p-5 mb-5
          dark:bg-surface-card dark:border-border bg-white border-gray-200"
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
            <GitBranch size={22} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold dark:text-text-primary text-gray-900 mb-1">
              {workflow.title}
            </h1>
            {workflow.description && (
              <p className="text-sm dark:text-text-secondary text-gray-500 leading-relaxed">
                {workflow.description}
              </p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={13} className="dark:text-text-muted text-gray-400" />
            <span className="text-sm font-semibold dark:text-text-primary text-gray-900">
              {usageCount}
            </span>
            <span className="text-xs dark:text-text-muted text-gray-400">runs</span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 ml-1">
              live
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs dark:text-text-muted text-gray-400">
              {(workflow.agents ?? []).length} agent{workflow.agents?.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            id="run-workflow-btn"
            onClick={handleRun}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white
              bg-accent hover:bg-accent-hover transition-all duration-200 active:scale-[0.97]
              shadow-md shadow-accent/20"
          >
            <Zap size={15} />
            Run Workflow
          </button>
          <button
            id="share-workflow-btn"
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
              dark:bg-surface-input dark:border-border dark:text-text-secondary dark:hover:text-text-primary
              bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Share2 size={14} />
                Share
              </>
            )}
          </button>
        </div>
      </div>

      {/* Agent Sequence */}
      <div
        className="rounded-xl border p-5
          dark:bg-surface-card dark:border-border bg-white border-gray-200"
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider dark:text-text-muted text-gray-400 mb-4">
          Agent Sequence
        </h2>
        <div>
          {(workflow.agents ?? []).map((agentId, index) => (
            <AgentRow
              key={agentId + index}
              agentId={agentId}
              index={index}
              total={workflow.agents.length}
            />
          ))}
        </div>
        <p className="mt-4 text-[11px] dark:text-text-muted text-gray-400">
          Each agent's output becomes the input for the next agent in the chain.
        </p>
      </div>
    </div>
  )
}
