import { useState, useEffect, useCallback } from 'react'
import { streamAgent } from './llmAdapter'
import { resolveAgentModel } from './resolveAgentModel'

const STORAGE_KEY = 'ila_scheduled_jobs'
const HISTORY_KEY = 'ila_scheduler_results'
const API_KEY_PREFIX = 'ila_scheduler_key_'
const MAX_RESULTS = 50

// ── Intervals in milliseconds
export const SCHEDULE_OPTIONS = [
  { value: 'hourly',    label: 'Every hour',    ms: 60 * 60 * 1000 },
  { value: 'daily',     label: 'Every day',     ms: 24 * 60 * 60 * 1000 },
  { value: 'weekly',    label: 'Every week',    ms: 7 * 24 * 60 * 60 * 1000 },
]

// ── Read / write helpers
function getStoredJobKey(jobId) {
  try { return sessionStorage.getItem(API_KEY_PREFIX + jobId) || '' }
  catch { return '' }
}

function setStoredJobKey(jobId, apiKey) {
  try {
    if (apiKey) sessionStorage.setItem(API_KEY_PREFIX + jobId, apiKey)
    else sessionStorage.removeItem(API_KEY_PREFIX + jobId)
  } catch {}
}

function removeStoredJobKey(jobId) {
  setStoredJobKey(jobId, '')
}

function stripJobSecret(job) {
  const { apiKey, ...safeJob } = job
  return safeJob
}

function loadJobs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      .map(job => ({ ...job, apiKey: getStoredJobKey(job.id) }))
  }
  catch { return [] }
}

function saveJobs(jobs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs.map(stripJobSecret)))
}

function loadResults() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') }
  catch { return [] }
}

function saveResults(results) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(results))
}

// ── Browser notification helper
function notify(title, body) {
  if (!('Notification' in window)) return
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' })
  }
}

/**
 * useScheduler — manages scheduled agent jobs stored in localStorage.
 *
 * A "job" object shape:
 * {
 *   id: string,
 *   agentId: string,
 *   agentName: string,
 *   agentDefinition: Object,   // full agent object snapshot
 *   inputs: Object,
 *   provider: string,
 *   model: string,
 *   apiKey: string,            // encrypted? no — same trust as sessionStorage
 *   schedule: 'hourly' | 'daily' | 'weekly',
 *   createdAt: number,
 *   lastRunAt: number | null,
 *   nextRunAt: number,
 *   enabled: boolean,
 *   label: string,             // user-facing name
 * }
 *
 * A "result" object shape:
 * {
 *   id: string,
 *   jobId: string,
 *   jobLabel: string,
 *   agentName: string,
 *   output: string,
 *   ranAt: number,
 *   duration: number,
 *   error: string | null,
 * }
 */
export function useScheduler() {
  const [jobs, setJobs] = useState(loadJobs)
  const [results, setResults] = useState(loadResults)
  const [running, setRunning] = useState({}) // jobId → boolean

  // ── Persist whenever state changes
  useEffect(() => { saveJobs(jobs) }, [jobs])
  useEffect(() => { saveResults(results) }, [results])

  // ── Add a new scheduled job
  const addJob = useCallback((jobData) => {
    const interval = SCHEDULE_OPTIONS.find(s => s.value === jobData.schedule)
    const now = Date.now()
    const { apiKey, ...safeJobData } = jobData
    const job = {
      ...safeJobData,
      id: `job_${now}_${Math.random().toString(36).slice(2)}`,
      createdAt: now,
      lastRunAt: null,
      nextRunAt: now + (interval?.ms ?? 86_400_000),
      enabled: true,
      apiKey,
    }
    setStoredJobKey(job.id, apiKey)
    setJobs(prev => [job, ...prev])
    return job
  }, [])

  // ── Toggle enabled/disabled
  const toggleJob = useCallback((jobId) => {
    setJobs(prev => prev.map(j =>
      j.id === jobId ? { ...j, enabled: !j.enabled } : j
    ))
  }, [])

  // ── Delete a job
  const deleteJob = useCallback((jobId) => {
    removeStoredJobKey(jobId)
    setJobs(prev => prev.filter(j => j.id !== jobId))
  }, [])

  // ── Delete a result
  const deleteResult = useCallback((resultId) => {
    setResults(prev => prev.filter(r => r.id !== resultId))
  }, [])

  // ── Clear all results for a job
  const clearResultsForJob = useCallback((jobId) => {
    setResults(prev => prev.filter(r => r.jobId !== jobId))
  }, [])

  // ── Manually run a job right now
  const runJob = useCallback(async (job) => {
    setRunning(prev => ({ ...prev, [job.id]: true }))
    const startTime = Date.now()
    let output = ''
    let errorMsg = null

    try {
      const agent = job.agentDefinition
      const actualProvider = agent.provider === 'any' ? job.provider : agent.provider
      const model = resolveAgentModel(agent, actualProvider, job.model)

      // Build user message from saved inputs
      const parts = []
      agent.inputs.forEach((input) => {
        const val = job.inputs[input.id]
        if (!val || (Array.isArray(val) && val.length === 0)) return
        parts.push(
          Array.isArray(val)
            ? `${input.label}: ${val.join(', ')}`
            : `${input.label}: ${val}`
        )
      })
      const userMessage = parts.join('\n\n')

      const result = await streamAgent({
        provider: actualProvider,
        model,
        apiKey: job.apiKey,
        systemPrompt: agent.systemPrompt,
        userMessage,
        onChunk: () => {},
      })

      output = result.content
      notify(
        `✅ ${job.label} — Agent run complete`,
        `${job.agentName} finished. Open iloveAgents to see the output.`
      )
    } catch (err) {
      errorMsg = err.message || 'Unknown error'
      notify(
        `❌ ${job.label} — Agent run failed`,
        `${job.agentName}: ${errorMsg}`
      )
    }

    const duration = Date.now() - startTime
    const interval = SCHEDULE_OPTIONS.find(s => s.value === job.schedule)
    const now = Date.now()

    // Save result
    const newResult = {
      id: `result_${now}_${Math.random().toString(36).slice(2)}`,
      jobId: job.id,
      jobLabel: job.label,
      agentName: job.agentName,
      output,
      ranAt: now,
      duration,
      error: errorMsg,
    }

    setResults(prev => [newResult, ...prev].slice(0, MAX_RESULTS))

    // Update job timestamps
    setJobs(prev => prev.map(j =>
      j.id === job.id
        ? {
            ...j,
            lastRunAt: now,
            nextRunAt: now + (interval?.ms ?? 86_400_000),
          }
        : j
    ))

    setRunning(prev => ({ ...prev, [job.id]: false }))
    return newResult
  }, [])

  // ── On mount and every minute: check for due jobs and run them
  useEffect(() => {
    const checkDue = () => {
      const currentJobs = loadJobs()
      const now = Date.now()
      currentJobs.forEach(job => {
        if (!job.enabled) return
        if (!job.apiKey) return
        if (now >= job.nextRunAt) {
          runJob(job)
        }
      })
    }

    // Check immediately on mount
    checkDue()

    // Then check every 60 seconds
    const interval = setInterval(checkDue, 60_000)
    return () => clearInterval(interval)
  }, [runJob])

  return {
    jobs,
    results,
    running,
    addJob,
    toggleJob,
    deleteJob,
    deleteResult,
    clearResultsForJob,
    runJob,
  }
}
