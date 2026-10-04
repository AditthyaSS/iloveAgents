import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('./llmAdapter', () => ({
  streamAgent: vi.fn(async () => ({ content: 'generated output', duration: 12 })),
}))
vi.mock('./useAnalytics', () => ({ recordAnalyticsRun: vi.fn() }))

import { useScheduler, getJobReadiness } from './useScheduler'
import { streamAgent } from './llmAdapter'

const JOBS_KEY = 'ila_scheduled_jobs'
const KEY_PREFIX = 'ila_scheduler_key_'

const jobData = (overrides = {}) => ({
  agentId: 'code-reviewer',
  agentName: 'Code Reviewer',
  agentDefinition: { id: 'code-reviewer', name: 'Code Reviewer', provider: 'openai', inputs: [] },
  inputs: { code: 'const a = 1' },
  provider: 'openai',
  model: 'gpt-4o',
  schedule: 'daily',
  label: 'Nightly review',
  apiKey: 'sk-test',
  ...overrides,
})

const storedJobs = () => JSON.parse(localStorage.getItem(JOBS_KEY) || '[]')

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.clearAllMocks()
  streamAgent.mockResolvedValue({ content: 'generated output', duration: 12 })
})

describe('getJobReadiness', () => {
  it('reports a paused job as paused even when a key is present', () => {
    expect(getJobReadiness({ enabled: false, apiKey: 'sk-test' })).toBe('paused')
  })

  it('reports an enabled job with no key as missing-key', () => {
    expect(getJobReadiness({ enabled: true, apiKey: '' })).toBe('missing-key')
  })

  it('reports an enabled job with a key as ready', () => {
    expect(getJobReadiness({ enabled: true, apiKey: 'sk-test' })).toBe('ready')
  })

  it('does not blow up on a missing job', () => {
    expect(getJobReadiness(undefined)).toBe('paused')
    expect(getJobReadiness(null)).toBe('paused')
  })
})

describe('useScheduler key handling', () => {
  it('keeps the secret out of localStorage and stores it for the session', () => {
    const { result } = renderHook(() => useScheduler({ autoRun: false }))

    let created
    act(() => { created = result.current.addJob(jobData()) })

    const persisted = storedJobs()
    expect(persisted).toHaveLength(1)
    expect(persisted[0]).not.toHaveProperty('apiKey')
    expect(sessionStorage.getItem(KEY_PREFIX + created.id)).toBe('sk-test')
    expect(result.current.jobsNeedingKey).toEqual([])
  })

  it('flags a job whose key did not survive the browser session', () => {
    const { result } = renderHook(() => useScheduler({ autoRun: false }))
    act(() => { result.current.addJob(jobData()) })

    // Closing the browser clears sessionStorage but leaves the job in
    // localStorage, which is what the report describes.
    sessionStorage.clear()

    const { result: reopened } = renderHook(() => useScheduler({ autoRun: false }))

    expect(reopened.current.jobs).toHaveLength(1)
    expect(reopened.current.jobs[0].apiKey).toBe('')
    expect(getJobReadiness(reopened.current.jobs[0])).toBe('missing-key')
    expect(reopened.current.jobsNeedingKey.map(job => job.label)).toEqual(['Nightly review'])
  })

  it('leaves a paused job out of the jobs that need a key', () => {
    const { result } = renderHook(() => useScheduler({ autoRun: false }))
    let created
    act(() => { created = result.current.addJob(jobData()) })
    sessionStorage.clear()

    const { result: reopened } = renderHook(() => useScheduler({ autoRun: false }))
    act(() => { reopened.current.toggleJob(created.id) })

    expect(reopened.current.jobsNeedingKey).toEqual([])
    expect(getJobReadiness(reopened.current.jobs[0])).toBe('paused')
  })

  it('re-attaches a key to a job that lost it', () => {
    const { result } = renderHook(() => useScheduler({ autoRun: false }))
    let created
    act(() => { created = result.current.addJob(jobData()) })
    sessionStorage.clear()

    const { result: reopened } = renderHook(() => useScheduler({ autoRun: false }))
    expect(reopened.current.jobsNeedingKey).toHaveLength(1)

    act(() => { reopened.current.updateJobApiKey(created.id, 'sk-reentered') })

    expect(reopened.current.jobsNeedingKey).toEqual([])
    expect(getJobReadiness(reopened.current.jobs[0])).toBe('ready')
    expect(sessionStorage.getItem(KEY_PREFIX + created.id)).toBe('sk-reentered')
  })

  it('clears the session key when an empty key is passed in', () => {
    const { result } = renderHook(() => useScheduler({ autoRun: false }))
    let created
    act(() => { created = result.current.addJob(jobData()) })

    act(() => { result.current.updateJobApiKey(created.id, '') })

    expect(sessionStorage.getItem(KEY_PREFIX + created.id)).toBeNull()
    expect(result.current.jobsNeedingKey).toHaveLength(1)
  })
})

describe('useScheduler runJob', () => {
  it('does not call the provider for a job that has no key', async () => {
    const { result } = renderHook(() => useScheduler({ autoRun: false }))
    act(() => { result.current.addJob(jobData()) })
    sessionStorage.clear()

    const { result: reopened } = renderHook(() => useScheduler({ autoRun: false }))

    let outcome
    await act(async () => {
      outcome = await reopened.current.runJob(reopened.current.jobs[0])
    })

    expect(outcome).toBeNull()
    expect(streamAgent).not.toHaveBeenCalled()
    expect(reopened.current.results).toEqual([])
  })

  it('runs a job whose key is still available and records the result', async () => {
    const { result } = renderHook(() => useScheduler({ autoRun: false }))

    let created
    act(() => { created = result.current.addJob(jobData()) })

    await act(async () => { await result.current.runJob(created) })

    expect(streamAgent).toHaveBeenCalledTimes(1)
    expect(result.current.results).toHaveLength(1)
    expect(result.current.results[0].output).toBe('generated output')
    expect(result.current.results[0].error).toBeNull()
  })
})
