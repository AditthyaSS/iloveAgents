import { useState } from 'react'
import {
  Clock, Play, Trash2, ToggleLeft, ToggleRight,
  ChevronDown, ChevronRight, AlertCircle, CheckCircle2,
  Calendar, Zap, Loader2, X
} from 'lucide-react'
import { useScheduler, SCHEDULE_OPTIONS } from '../lib/useScheduler'
import OutputRenderer from '../components/OutputRenderer'
import { useDocumentTitle } from '../lib/useDocumentTitle'

function formatNextRun(nextRunAt) {
  if (!nextRunAt) return '—'
  const diff = nextRunAt - Date.now()
  if (diff <= 0) return 'Due now'
  const mins = Math.floor(diff / 60_000)
  const hrs = Math.floor(mins / 60)
  const days = Math.floor(hrs / 24)
  if (days > 0) return `in ${days}d ${hrs % 24}h`
  if (hrs > 0) return `in ${hrs}h ${mins % 60}m`
  return `in ${mins}m`
}

function formatDate(ts) {
  if (!ts) return 'Never'
  return new Date(ts).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatDuration(ms) {
  if (!ms) return ''
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export default function SchedulerPage() {
  useDocumentTitle('Scheduled Agents')

  const {
    jobs, results, running,
    toggleJob, deleteJob, runJob,
    deleteResult, clearResultsForJob,
  } = useScheduler()

  const [expandedJob, setExpandedJob] = useState(null)
  const [expandedResult, setExpandedResult] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const handleRequestNotification = () => {
    if (!('Notification' in window)) return
    Notification.requestPermission()
  }

  const notifStatus = 'Notification' in window ? Notification.permission : 'unsupported'

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock size={20} className="text-accent" />
            <h1 className="text-xl font-bold dark:text-text-primary text-gray-900">
              Scheduled Agents
            </h1>
          </div>
          <p className="text-xs dark:text-text-secondary text-gray-500">
            Agents you've scheduled to run automatically. Results are saved here and delivered via browser notifications.
          </p>
        </div>

        {/* Notification permission banner */}
        {notifStatus === 'default' && (
          <button
            onClick={handleRequestNotification}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
              bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-colors"
          >
            <Zap size={13} />
            Enable notifications
          </button>
        )}
        {notifStatus === 'denied' && (
          <div className="flex items-center gap-1.5 text-xs text-amber-500">
            <AlertCircle size={13} />
            Notifications blocked
          </div>
        )}
      </div>

      {/* Empty state */}
      {jobs.length === 0 && (
        <div className="text-center py-16 rounded-xl border dark:bg-surface-card dark:border-border bg-white border-gray-200">
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Calendar size={24} className="text-accent" />
          </div>
          <h3 className="text-sm font-semibold dark:text-text-primary text-gray-900 mb-2">
            No scheduled agents yet
          </h3>
          <p className="text-xs dark:text-text-secondary text-gray-500 max-w-xs mx-auto">
            Open any agent, fill in your inputs, then click "Schedule" to set it to run automatically.
          </p>
        </div>
      )}

      {/* Jobs list */}
      {jobs.length > 0 && (
        <div className="space-y-3 mb-8">
          {jobs.map(job => {
            const jobResults = results.filter(r => r.jobId === job.id)
            const isRunning = running[job.id]
            const scheduleLabel = SCHEDULE_OPTIONS.find(s => s.value === job.schedule)?.label ?? job.schedule
            const isExpanded = expandedJob === job.id

            return (
              <div
                key={job.id}
                className="rounded-xl border transition-all duration-200
                  dark:bg-surface-card dark:border-border bg-white border-gray-200"
              >
                {/* Job header */}
                <div className="flex items-center gap-3 p-4">
                  {/* Toggle */}
                  <button
                    onClick={() => toggleJob(job.id)}
                    className={`flex-shrink-0 transition-colors ${job.enabled ? 'text-accent' : 'dark:text-text-muted text-gray-300'}`}
                    title={job.enabled ? 'Disable' : 'Enable'}
                  >
                    {job.enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold dark:text-text-primary text-gray-900 truncate">
                        {job.label}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full dark:bg-surface-hover bg-gray-100 dark:text-text-muted text-gray-500">
                        {scheduleLabel}
                      </span>
                      {!job.enabled && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-500 dark:bg-surface-hover dark:text-text-muted">
                          Paused
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-[11px] dark:text-text-muted text-gray-400">
                        {job.agentName}
                      </span>
                      <span className="text-[11px] dark:text-text-muted text-gray-400">
                        Last run: {formatDate(job.lastRunAt)}
                      </span>
                      {job.enabled && (
                        <span className="text-[11px] text-accent">
                          Next: {formatNextRun(job.nextRunAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Run now */}
                    <button
                      onClick={() => runJob(job)}
                      disabled={isRunning}
                      title="Run now"
                      className="p-1.5 rounded-md dark:hover:bg-surface-hover hover:bg-gray-100 transition-colors
                        dark:text-text-secondary text-gray-500 hover:text-accent
                        disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isRunning
                        ? <Loader2 size={15} className="animate-spin text-accent" />
                        : <Play size={15} />
                      }
                    </button>

                    {/* Expand results */}
                    <button
                      onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                      title="View results"
                      className="p-1.5 rounded-md dark:hover:bg-surface-hover hover:bg-gray-100 transition-colors
                        dark:text-text-secondary text-gray-500"
                    >
                      {isExpanded
                        ? <ChevronDown size={15} />
                        : <ChevronRight size={15} />
                      }
                    </button>

                    {/* Delete */}
                    {confirmDelete === job.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { deleteJob(job.id); clearResultsForJob(job.id); setConfirmDelete(null) }}
                          className="text-[10px] font-medium text-red-500 hover:text-red-600 px-2 py-1 rounded-md bg-red-500/10 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="p-1 rounded-md dark:text-text-muted text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(job.id)}
                        title="Delete"
                        className="p-1.5 rounded-md dark:hover:bg-surface-hover hover:bg-gray-100 transition-colors
                          dark:text-text-muted text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Results panel */}
                {isExpanded && (
                  <div className="border-t dark:border-border border-gray-100 px-4 py-3 animate-fade-in">
                    {jobResults.length === 0 ? (
                      <p className="text-xs dark:text-text-muted text-gray-400 py-2">
                        No results yet. Click ▶ to run now.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider dark:text-text-muted text-gray-400">
                            {jobResults.length} result{jobResults.length !== 1 ? 's' : ''}
                          </span>
                          <button
                            onClick={() => clearResultsForJob(job.id)}
                            className="text-[10px] text-red-400 hover:text-red-500 transition-colors"
                          >
                            Clear all
                          </button>
                        </div>
                        {jobResults.map(result => (
                          <ResultCard
                            key={result.id}
                            result={result}
                            expanded={expandedResult === result.id}
                            onToggle={() => setExpandedResult(expandedResult === result.id ? null : result.id)}
                            onDelete={() => deleteResult(result.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ResultCard({ result, expanded, onToggle, onDelete }) {
  return (
    <div className="rounded-lg border dark:border-border border-gray-100 dark:bg-surface-hover bg-gray-50 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2">
        {result.error
          ? <AlertCircle size={13} className="text-red-400 flex-shrink-0" />
          : <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
        }
        <span className="text-[11px] dark:text-text-secondary text-gray-600 flex-1">
          {formatDate(result.ranAt)}
          {result.duration ? ` · ${formatDuration(result.duration)}` : ''}
        </span>
        <button
          onClick={onToggle}
          className="text-[10px] text-accent hover:underline"
        >
          {expanded ? 'Hide' : 'View'}
        </button>
        <button
          onClick={onDelete}
          className="p-0.5 dark:text-text-muted text-gray-400 hover:text-red-500 transition-colors"
        >
          <X size={12} />
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-3 border-t dark:border-border border-gray-200 pt-2 animate-fade-in">
          {result.error ? (
            <div className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">
              {result.error}
            </div>
          ) : (
            <OutputRenderer
              content={result.output}
              outputType="markdown"
              agentName={result.agentName}
              systemPrompt=""
            />
          )}
        </div>
      )}
    </div>
  )
}
