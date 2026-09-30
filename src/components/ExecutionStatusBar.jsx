import { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  StopCircle,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Play,
  Zap,
  RefreshCw,
  Sliders,
  ShieldAlert,
} from 'lucide-react'
import { EXECUTION_STATES, STEP_STATES } from '../lib/agentExecutionEngine'

const STATUS_CONFIGS = {
  [EXECUTION_STATES.PENDING]: {
    label: 'Pending',
    pill: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
    icon: Clock,
  },
  [EXECUTION_STATES.RUNNING]: {
    label: 'Running',
    pill: 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30 animate-pulse',
    icon: Loader2,
    spin: true,
  },
  [EXECUTION_STATES.COMPLETED]: {
    label: 'Completed',
    pill: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    icon: CheckCircle2,
  },
  [EXECUTION_STATES.FAILED]: {
    label: 'Failed',
    pill: 'bg-red-500/15 text-red-500 border-red-500/30',
    icon: XCircle,
  },
  [EXECUTION_STATES.CANCELLED]: {
    label: 'Cancelled',
    pill: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
    icon: StopCircle,
  },
  [EXECUTION_STATES.INTERRUPTED]: {
    label: 'Interrupted',
    pill: 'bg-orange-500/15 text-orange-500 border-orange-500/30',
    icon: AlertTriangle,
  },
}

function StepIcon({ status }) {
  if (status === STEP_STATES.COMPLETED) {
    return <CheckCircle2 size={16} className="text-emerald-500" />
  }
  if (status === STEP_STATES.RUNNING) {
    return <Loader2 size={16} className="text-accent animate-spin" />
  }
  if (status === STEP_STATES.FAILED) {
    return <XCircle size={16} className="text-red-500" />
  }
  if (status === STEP_STATES.CANCELLED) {
    return <StopCircle size={16} className="text-gray-400" />
  }
  return <Clock size={16} className="dark:text-text-muted text-gray-400" />
}

export default function ExecutionStatusBar({
  execution,
  isRetrying,
  retryCountdown,
  onRetry,
  onResume,
  onCancel,
  onClear,
  retryPolicy,
  onUpdateRetryPolicy,
}) {
  const [copiedId, setCopiedId] = useState(false)
  const [expandedStepIndex, setExpandedStepIndex] = useState(null)
  const [showPolicySettings, setShowPolicySettings] = useState(false)

  if (!execution) return null

  const statusConfig = STATUS_CONFIGS[execution.status] || STATUS_CONFIGS[EXECUTION_STATES.PENDING]
  const StatusIcon = statusConfig.icon

  const handleCopyId = () => {
    if (!execution?.executionId) return
    navigator.clipboard.writeText(execution.executionId)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const completedCount =
    execution.steps?.filter((s) => s.status === STEP_STATES.COMPLETED).length || 0
  const totalCount = execution.steps?.length || 1
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  return (
    <div className="mb-5 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-surface-card shadow-sm overflow-hidden transition-all animate-fade-in">
      {/* Top Header Bar */}
      <div className="p-3.5 border-b border-gray-100 dark:border-border/60 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50 dark:bg-surface-hover/30">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.pill}`}
          >
            <StatusIcon size={13} className={statusConfig.spin ? 'animate-spin' : ''} />
            <span>{statusConfig.label}</span>
          </div>

          {/* Execution ID with Copy */}
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-text-secondary bg-white dark:bg-surface-input px-2.5 py-1 rounded-md border border-gray-200 dark:border-border font-mono">
            <span className="text-[11px] text-gray-400 dark:text-text-muted">ID:</span>
            <span className="truncate max-w-[170px]" title={execution.executionId}>
              {execution.executionId}
            </span>
            <button
              onClick={handleCopyId}
              title="Copy Execution ID"
              className="p-0.5 hover:text-accent transition-colors ml-0.5"
            >
              {copiedId ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            </button>
          </div>

          {/* Elapsed Duration */}
          {execution.durationMs > 0 && (
            <span className="text-xs text-gray-500 dark:text-text-muted flex items-center gap-1">
              <Clock size={12} />
              {(execution.durationMs / 1000).toFixed(1)}s
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Policy Settings Toggle */}
          <button
            onClick={() => setShowPolicySettings(!showPolicySettings)}
            title="Configure Retry Policy"
            className="p-1.5 rounded-lg text-gray-400 hover:text-accent hover:bg-gray-100 dark:hover:bg-surface-hover transition-colors"
          >
            <Sliders size={14} />
          </button>

          {/* Resume button for Interrupted / Failed runs */}
          {(execution.status === EXECUTION_STATES.INTERRUPTED ||
            execution.status === EXECUTION_STATES.FAILED) && (
            <button
              onClick={onResume || onRetry}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-accent text-white hover:bg-accent-hover shadow-sm transition-all"
            >
              <RotateCcw size={12} />
              {execution.status === EXECUTION_STATES.INTERRUPTED ? 'Resume Run' : 'Retry Failed Step'}
            </button>
          )}

          {/* Cancel button for active run */}
          {execution.status === EXECUTION_STATES.RUNNING && (
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all"
            >
              <StopCircle size={12} />
              Cancel
            </button>
          )}

          {/* Dismiss / Clear button */}
          {(execution.status === EXECUTION_STATES.COMPLETED ||
            execution.status === EXECUTION_STATES.FAILED ||
            execution.status === EXECUTION_STATES.CANCELLED) && (
            <button
              onClick={onClear}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-text-primary px-2 py-1 rounded transition-colors"
            >
              Start New Run
            </button>
          )}
        </div>
      </div>

      {/* Retry Policy Configuration Drawer */}
      {showPolicySettings && (
        <div className="p-3 border-b border-gray-100 dark:border-border/60 bg-gray-50/80 dark:bg-surface-input/50 text-xs animate-fade-in flex flex-wrap items-center gap-4">
          <span className="font-semibold text-gray-700 dark:text-text-primary">
            Retry Policy:
          </span>
          <label className="flex items-center gap-1.5 text-gray-600 dark:text-text-secondary">
            Max Retries:
            <select
              value={retryPolicy?.maxRetries ?? 3}
              onChange={(e) =>
                onUpdateRetryPolicy?.({
                  ...retryPolicy,
                  maxRetries: Number(e.target.value),
                })
              }
              className="bg-white dark:bg-surface-card border border-gray-300 dark:border-border rounded px-2 py-0.5 text-xs outline-none"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="5">5</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-gray-600 dark:text-text-secondary">
            Initial Delay:
            <select
              value={retryPolicy?.initialDelayMs ?? 1000}
              onChange={(e) =>
                onUpdateRetryPolicy?.({
                  ...retryPolicy,
                  initialDelayMs: Number(e.target.value),
                })
              }
              className="bg-white dark:bg-surface-card border border-gray-300 dark:border-border rounded px-2 py-0.5 text-xs outline-none"
            >
              <option value="500">500ms</option>
              <option value="1000">1.0s</option>
              <option value="2000">2.0s</option>
            </select>
          </label>
          <span className="text-[11px] text-gray-400 dark:text-text-muted ml-auto">
            Uses exponential backoff for transient 429 / 5xx & network drops.
          </span>
        </div>
      )}

      {/* Active Retry Banner */}
      {isRetrying && (
        <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <RefreshCw size={15} className="animate-spin text-amber-500 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-semibold">Transient failure detected.</span> Retrying step in{' '}
              <span className="font-bold font-mono px-1 py-0.5 rounded bg-amber-500/20">
                {retryCountdown !== null ? `${retryCountdown}s` : 'a moment'}
              </span>{' '}
              (Attempt {execution.retryState?.attempt || 1} of{' '}
              {execution.retryState?.maxRetries || retryPolicy?.maxRetries || 3})...
              {execution.retryState?.lastError && (
                <span className="block text-[11px] opacity-80 mt-0.5 truncate max-w-md">
                  Reason: {execution.retryState.lastError}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onRetry}
            className="px-2.5 py-1 rounded bg-amber-500 text-white font-medium text-xs hover:bg-amber-600 transition-colors flex-shrink-0"
          >
            Retry Now
          </button>
        </div>
      )}

      {/* Interrupted Run Recovery Banner */}
      {execution.status === EXECUTION_STATES.INTERRUPTED && (
        <div className="p-3.5 bg-orange-500/10 border-b border-orange-500/20 text-orange-800 dark:text-orange-300 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <ShieldAlert size={18} className="text-orange-500 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-semibold">Interrupted Run Recoverable.</span> This run was
              interrupted by a browser refresh or network drop.
              <span className="block text-[11px] opacity-90 mt-0.5">
                {completedCount} of {totalCount} steps completed. Resuming will start safely from
                the first incomplete step without repeating completed work.
              </span>
            </div>
          </div>
          <button
            onClick={onResume}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 text-white font-semibold text-xs hover:bg-orange-700 shadow-sm transition-all flex-shrink-0"
          >
            <Play size={12} />
            Resume Run
          </button>
        </div>
      )}

      {/* Failed Execution Alert */}
      {execution.status === EXECUTION_STATES.FAILED && execution.error && (
        <div className="p-3.5 bg-red-500/10 border-b border-red-500/20 text-red-700 dark:text-red-400 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <XCircle size={18} className="text-red-500 flex-shrink-0" />
            <div className="text-xs min-w-0">
              <span className="font-semibold">Execution Failed:</span>{' '}
              <span className="break-words">
                {execution.error.message || String(execution.error)}
              </span>
              {execution.error.retryable && (
                <span className="block text-[11px] opacity-80 mt-0.5">
                  This failure is retryable. You can resume or retry the failed step.
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white font-semibold text-xs hover:bg-red-700 shadow-sm transition-all flex-shrink-0"
          >
            <RotateCcw size={12} />
            Retry Step
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 dark:bg-surface-input h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            execution.status === EXECUTION_STATES.COMPLETED
              ? 'bg-emerald-500'
              : execution.status === EXECUTION_STATES.FAILED
              ? 'bg-red-500'
              : 'bg-accent'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Pipeline Stepper */}
      <div className="p-3 space-y-1.5">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-text-muted">
            Execution Steps ({completedCount}/{totalCount})
          </span>
          <span className="text-[11px] text-gray-400 dark:text-text-muted">
            {progressPercent}% Complete
          </span>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-border/40">
          {execution.steps?.map((step, idx) => {
            const isExpanded = expandedStepIndex === idx
            return (
              <div key={step.id || idx} className="py-2 first:pt-0 last:pb-0">
                <button
                  onClick={() => setExpandedStepIndex(isExpanded ? null : idx)}
                  className="w-full flex items-center justify-between gap-3 text-left py-1 hover:bg-gray-50/50 dark:hover:bg-surface-hover/30 rounded-lg px-2 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <StepIcon status={step.status} />
                    <span className="text-xs font-medium text-gray-800 dark:text-text-primary truncate">
                      {step.name}
                    </span>
                    {step.retryCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        {step.retryCount} {step.retryCount === 1 ? 'retry' : 'retries'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {step.durationMs > 0 && (
                      <span className="text-[11px] text-gray-400 dark:text-text-muted">
                        {(step.durationMs / 1000).toFixed(1)}s
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                        step.status === STEP_STATES.COMPLETED
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : step.status === STEP_STATES.RUNNING
                          ? 'bg-accent/10 text-accent animate-pulse'
                          : step.status === STEP_STATES.FAILED
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-gray-100 dark:bg-surface-input text-gray-400'
                      }`}
                    >
                      {step.status}
                    </span>
                    {isExpanded ? (
                      <ChevronDown size={14} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={14} className="text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Step Details */}
                {isExpanded && (
                  <div className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-[#0d1117] border border-gray-100 dark:border-border text-xs space-y-2 animate-fade-in font-mono">
                    {step.startedAt && (
                      <div className="text-[11px] text-gray-400">
                        Started: {new Date(step.startedAt).toLocaleTimeString()}
                      </div>
                    )}
                    {step.error && (
                      <div className="p-2 rounded bg-red-500/10 text-red-400 text-xs border border-red-500/20">
                        <div className="font-semibold mb-0.5">Error Details:</div>
                        <div>{step.error.message || String(step.error)}</div>
                      </div>
                    )}
                    {step.output && (
                      <div>
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-text-muted uppercase">
                          Checkpoint Output Preview:
                        </span>
                        <pre className="mt-1 p-2 rounded bg-white dark:bg-surface-card border border-gray-200 dark:border-border max-h-36 overflow-y-auto text-[11px] whitespace-pre-wrap break-words text-gray-700 dark:text-text-secondary">
                          {typeof step.output === 'object'
                            ? JSON.stringify(step.output, null, 2)
                            : String(step.output).slice(0, 1000)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
