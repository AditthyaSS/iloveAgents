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
} from 'lucide-react'
import * as Icons from 'lucide-react'
import agents from '../agents/registry'
import OutputRenderer from '../components/OutputRenderer'
import ApiKeyBar from '../components/ApiKeyBar'
import { useApiKey } from '../lib/useApiKey'
import { runAgent } from '../lib/llmAdapter'
import { fetchWorkflowById, incrementUsage } from '../hooks/useWorkflows'

const MODEL_MAP = {
  openai: 'gpt-4o',
  anthropic: 'claude-opus-4-20250514',
  gemini: 'gemini-2.5-flash',
}

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

  const [userInput, setUserInput] = useState('')
  const [running, setRunning] = useState(false)
  const [steps, setSteps] = useState([])
  const [allDone, setAllDone] = useState(false)
  const [hasRun, setHasRun] = useState(false)

  // Fetch workflow if not passed via state
  useEffect(() => {
    if (workflow) return
    if (!id || id === 'preview') {
      setFetchError('Workflow not found.')
      setLoadingWorkflow(false)
      return
    }
    fetchWorkflowById(id).then(({ data, error }) => {
      if (error || !data) {
        setFetchError('Could not load workflow.')
      } else {
        setWorkflow(data)
      }
      setLoadingWorkflow(false)
    })
  }, [id])

  // Initialize step states when workflow is ready
  useEffect(() => {
    if (!workflow) return
    setSteps(
      (workflow.agents ?? []).map((agentId) => {
        const agent = agents.find((a) => a.id === agentId)
        return {
          agentId,
          agentName: agent?.name ?? agentId,
          agent,
          status: 'waiting',
          output: null,
          error: null,
        }
      })
    )
  }, [workflow])

  const setStepField = (index, fields) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, ...fields } : s)))
  }

  const handleRun = async () => {
    if (!userInput.trim() || !apiKey || running) return
    setRunning(true)
    setAllDone(false)
    setHasRun(true)

    // Reset all steps to waiting
    setSteps((prev) => prev.map((s) => ({ ...s, status: 'waiting', output: null, error: null })))

    let currentInput = userInput.trim()
    let failed = false

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      if (!step.agent) {
        setStepField(i, { status: 'failed', error: `Agent "${step.agentId}" not found in registry.` })
        failed = true
        break
      }

      setStepField(i, { status: 'running' })

      const actualProvider =
        step.agent.provider === 'any'
          ? provider
          : step.agent.provider

      const model = step.agent.model || MODEL_MAP[actualProvider] || MODEL_MAP.openai

      try {
        const result = await runAgent({
          provider: actualProvider,
          model,
          apiKey,
          systemPrompt: step.agent.systemPrompt,
          userMessage: currentInput,
        })
        setStepField(i, { status: 'done', output: result.content })
        currentInput = result.content // pass output to next step
      } catch (err) {
        setStepField(i, { status: 'failed', error: err.message })
        failed = true
        break
      }
    }

    if (!failed) {
      setAllDone(true)
      // Increment usage count if workflow is persisted
      if (workflow?.id) {
        await incrementUsage(workflow.id)
      }
    }

    setRunning(false)
  }

  const handleRunAgain = () => {
    setAllDone(false)
    setHasRun(false)
    setSteps((prev) => prev.map((s) => ({ ...s, status: 'waiting', output: null, error: null })))
  }

  // Loading workflow from Supabase
  if (loadingWorkflow) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 animate-fade-in">
        <Loader2 size={24} className="animate-spin text-accent" />
        <p className="text-sm dark:text-text-secondary text-gray-500">Loading workflow...</p>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 animate-fade-in">
        <AlertCircle size={28} className="text-red-400 mx-auto mb-3" />
        <p className="text-sm dark:text-text-secondary text-gray-500 mb-4">{fetchError}</p>
        <button
          onClick={() => navigate('/workflows')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
        >
          <ArrowLeft size={14} /> Back to Library
        </button>
      </div>
    )
  }

  const hasFailed = steps.some((s) => s.status === 'failed')

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-md transition-colors
            dark:hover:bg-surface-hover dark:text-text-secondary
            hover:bg-gray-100 text-gray-500"
          aria-label="Back"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-base font-bold dark:text-text-primary text-gray-900">
            {workflow?.title ?? 'Run Workflow'}
          </h1>
          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
            {steps.map((step, i) => (
              <span key={step.agentId + i} className="flex items-center gap-1">
                <span className="text-[11px] dark:text-text-muted text-gray-400">{step.agentName}</span>
                {i < steps.length - 1 && (
                  <ArrowRight size={10} className="dark:text-text-muted text-gray-400" />
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* API Key Bar */}
      <ApiKeyBar
        provider={provider}
        setProvider={setProvider}
        apiKey={apiKey}
        setApiKey={setApiKey}
        saveForSession={saveForSession}
        setSaveForSession={setSaveForSession}
        agentProvider="any"
        model={MODEL_MAP[provider] || MODEL_MAP.openai}
        setModel={() => {}}
      />

      {/* Input */}
      <div className="mb-4">
        <label className="block text-xs font-medium dark:text-text-secondary text-gray-600 mb-1.5">
          Your Input <span className="text-red-400">*</span>
          <span className="ml-1 dark:text-text-muted text-gray-400 font-normal">
            — passed to the first agent, then chained through each step
          </span>
        </label>
        <textarea
          id="workflow-input"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Paste your main input here. The first agent will process this, and each subsequent agent receives the previous output."
          rows={4}
          disabled={running}
          className="w-full px-3 py-2.5 rounded-lg border text-sm transition-all resize-y
            dark:bg-surface-card dark:border-border dark:text-text-primary dark:placeholder-text-muted
            bg-white border-gray-200 text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50
            disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      {/* Run Button */}
      <div className="flex items-center gap-3 mb-8">
        {!hasRun || allDone || hasFailed ? (
          <button
            id="run-workflow-btn"
            onClick={hasRun && (allDone || hasFailed) ? handleRunAgain : handleRun}
            disabled={!userInput.trim() || !apiKey || running}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white
              bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-200 active:scale-[0.98]"
          >
            {running ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Running...
              </>
            ) : hasRun && (allDone || hasFailed) ? (
              <>
                <RotateCcw size={15} />
                Run Again
              </>
            ) : (
              <>
                <Zap size={15} />
                Run Workflow
              </>
            )}
          </button>
        ) : (
          <button
            disabled
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white
              bg-accent opacity-40 cursor-not-allowed"
          >
            <Loader2 size={15} className="animate-spin" />
            Running...
          </button>
        )}

        {allDone && <CopyAllButton steps={steps} />}
      </div>

      {/* Steps */}
      {hasRun && (
        <div className="space-y-4">
          {steps.map((step, index) => {
            const IconComponent = (step.agent && Icons[step.agent.icon]) || Icons.Bot
            return (
              <div
                key={step.agentId + index}
                className="rounded-lg border transition-all duration-200 animate-fade-in
                  dark:bg-surface-card dark:border-border bg-white border-gray-200"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* Step Header */}
                <div className="flex items-center gap-3 p-3 border-b dark:border-border border-gray-100">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-accent/10 text-[10px] font-bold text-accent flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="w-7 h-7 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <IconComponent size={13} className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium dark:text-text-primary text-gray-900">
                      {step.agentName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StepStatusIcon status={step.status} />
                    <span className={`text-[11px] font-medium capitalize ${STATUS_COLORS[step.status] || ''}`}>
                      {step.status}
                    </span>
                  </div>
                </div>

                {/* Step Body */}
                {step.status === 'running' && (
                  <div className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin text-accent" />
                      <span className="text-xs dark:text-text-secondary text-gray-500">Processing...</span>
                    </div>
                  </div>
                )}

                {step.status === 'done' && step.output && (
                  <div className="p-4">
                    <OutputRenderer
                      content={step.output}
                      outputType={step.agent?.outputType ?? 'text'}
                      agentName={step.agentName}
                    />
                  </div>
                )}

                {step.status === 'failed' && step.error && (
                  <div className="p-4">
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-red-400 mb-1">Step failed</p>
                        <p className="text-xs text-red-400/80">{step.error}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleRunAgain}
                      className="mt-3 flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
                    >
                      <RotateCcw size={12} />
                      Retry from start
                    </button>
                  </div>
                )}

                {step.status === 'waiting' && (
                  <div className="px-4 py-3">
                    <p className="text-[11px] dark:text-text-muted text-gray-400">Waiting for previous step...</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* All done banner */}
      {allDone && (
        <div className="mt-6 p-4 rounded-lg border bg-emerald-500/10 border-emerald-500/20 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">
              Workflow complete! All {steps.length} steps finished successfully.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
