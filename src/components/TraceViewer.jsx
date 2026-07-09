import { useState } from 'react'
import { ChevronDown, CheckCircle2, XCircle, Timer } from 'lucide-react'
import { formatDuration } from '../lib/executionTrace'

const BAR_COLORS = {
  done: 'bg-emerald-400/70',
  failed: 'bg-red-400/70',
}

function StepStatusIcon({ status }) {
  if (status === 'failed') return <XCircle size={14} className="text-red-400" />
  return <CheckCircle2 size={14} className="text-emerald-400" />
}

function TraceStep({ step, index, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div
      className="rounded-lg border overflow-hidden
        dark:bg-surface-card dark:border-border bg-white border-gray-200"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 p-3 text-left transition-colors
          dark:hover:bg-surface-hover hover:bg-gray-50"
      >
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-accent/10 text-[10px] font-bold text-accent flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium dark:text-text-primary text-gray-900 truncate block">
            {step.stepName}
          </span>
          <span className="text-[11px] dark:text-text-muted text-gray-400">{step.stepType}</span>
        </div>
        <span
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium
            dark:bg-surface-hover dark:text-text-secondary bg-gray-100 text-gray-600"
        >
          <Timer size={11} />
          {formatDuration(step.durationMs)}
        </span>
        <StepStatusIcon status={step.status} />
        <ChevronDown
          size={14}
          className={`dark:text-text-muted text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="border-t dark:border-border border-gray-100 p-3 space-y-3">
          {step.error && (
            <div className="p-2.5 rounded-md bg-red-500/10 border border-red-500/20">
              <p className="text-xs font-medium text-red-400 mb-0.5">Error</p>
              <p className="text-xs text-red-400/80 break-words">{step.error}</p>
            </div>
          )}
          <TracePayload label="Input" value={step.input} />
          <TracePayload label="Output" value={step.output} />
        </div>
      )}
    </div>
  )
}

function TracePayload({ label, value }) {
  if (value == null || value === '') return null
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide mb-1 dark:text-text-muted text-gray-400">
        {label}
      </p>
      <pre
        className="text-xs p-2.5 rounded-md overflow-x-auto whitespace-pre-wrap break-words max-h-64 overflow-y-auto
          dark:bg-surface-hover dark:text-text-secondary bg-gray-50 text-gray-700"
      >
        {value}
      </pre>
    </div>
  )
}

/**
 * Renders an execution trace: a duration timeline followed by an accordion
 * of step records. Steps that failed start expanded so the error is
 * immediately visible.
 */
export default function TraceViewer({ trace }) {
  if (!trace || !trace.steps?.length) {
    return (
      <p className="text-xs dark:text-text-muted text-gray-400 py-3">
        No trace recorded for this run yet.
      </p>
    )
  }

  const totalMs = trace.steps.reduce((sum, s) => sum + (s.durationMs || 0), 0)

  return (
    <div className="space-y-3">
      {/* Timeline: each segment width is proportional to the step duration */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide dark:text-text-muted text-gray-400">
            Timeline
          </span>
          <span className="text-[11px] dark:text-text-muted text-gray-400">
            Total {formatDuration(totalMs)}
          </span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden gap-px dark:bg-surface-hover bg-gray-100">
          {trace.steps.map((step, i) => (
            <div
              key={i}
              title={`${step.stepName}: ${formatDuration(step.durationMs)}`}
              className={`${BAR_COLORS[step.status] || 'bg-gray-300'} min-w-[4px]`}
              style={{ width: totalMs > 0 ? `${((step.durationMs || 0) / totalMs) * 100}%` : 'auto', flexGrow: totalMs > 0 ? 0 : 1 }}
            />
          ))}
        </div>
      </div>

      {/* Step accordion */}
      <div className="space-y-2">
        {trace.steps.map((step, i) => (
          <TraceStep key={i} step={step} index={i} defaultOpen={step.status === 'failed'} />
        ))}
      </div>
    </div>
  )
}
