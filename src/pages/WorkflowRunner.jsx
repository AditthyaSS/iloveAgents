import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Zap,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  ArrowRight,
  GitBranch,
} from 'lucide-react'
import * as Icons from 'lucide-react'
import { loadAllAgents } from '../agents/registry'
import OutputRenderer from '../components/OutputRenderer'
import ApiKeyBar from '../components/ApiKeyBar'
import RunRating from '../components/RunRating'
import { useApiKey } from '../lib/useApiKey'
import { recordAnalyticsRun } from '../lib/useAnalytics'
import { runAgent } from '../lib/llmAdapter'
import { resolveAgentModel, MODEL_MAP } from '../lib/resolveAgentModel'
import { fetchWorkflowById, incrementUsage } from '../hooks/useWorkflows'
import {
  isConditionalStep,
  evaluateConditionalStep,
  validateConditionalStep,
} from '../lib/pipelineBranching'
import { exportWorkflowAsMarkdown } from '../lib/exportMarkdown'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const STATUS_COLORS = {
  waiting: 'dark:text-text-muted text-gray-400',
  running: 'text-accent',
  done: 'text-emerald-400',
  failed: 'text-red-400',
}

function StepStatusIcon({ status }) {
  if (status === 'waiting') return <Clock size={15} className={STATUS_COLORS.waiting} />
  if (status === 'running') return <Loader2 size={15} className="text-accent animate-spin" />
  if (status === 'done') return <CheckCircle2 size={15} className={STATUS_COLORS.done} />
  if (status === 'failed') return <XCircle size={15} className={STATUS_COLORS.failed} />
  return null
}

function CopyAllButton({ steps }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const text = steps
      .filter((s) => s.status === 'done' && s.output)
      .map((s) => `=== ${s.agentName} ===\n\n${s.output}`)
      .join('\n\n---\n\n')

    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors
        dark:bg-surface-card dark:border-border dark:text-text-secondary dark:hover:text-text-primary
        bg-white border border-gray-200 text-gray-600 hover:text-gray-900"
    >
      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
      {copied ? 'Copied!' : 'Copy All Outputs'}
    </button>
  )
}

export default function WorkflowRunner() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const { provider, setProvider, apiKey, setApiKey, saveForSession, setSaveForSession } = useApiKey()

  const [workflow, setWorkflow] = useState(location.state?.workflow ?? null)
  const [loadingWorkflow, setLoadingWorkflow] = useState(!location.state?.workflow)
  const [fetchError, setFetchError] = useState(null)

  const [userInput, setUserInput] = useState(location.state?.initialInput ?? '')
  const [running, setRunning] = useState(false)
  const [steps, setSteps] = useState([])
  const [allDone, setAllDone] = useState(false)
  const [hasRun, setHasRun] = useState(false)
  useDocumentTitle(workflow?.title ? `Run ${workflow.title}` : 'Run Workflow')

  // Fetch workflow if not passed via state
  useEffect(() => {
    if (workflow) return
    if (!id || id === 'preview') {
      setFetchError('Workflow not found.')
      setLoadingWorkflow(false)
      return
    }
    fetchWorkflowById(id).then(({ data, error }) => {
    .catch(err => console.error(err))