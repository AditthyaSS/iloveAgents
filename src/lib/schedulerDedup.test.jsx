import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScheduler } from './useScheduler'
import { streamAgent } from './llmAdapter'

vi.mock('./llmAdapter', () => ({
  streamAgent: vi.fn(async () => ({ content: 'ok', duration: 1 })),
}))
vi.mock('./useAnalytics', () => ({
  recordAnalyticsRun: vi.fn(() => true),
}))

const baseJob = {
  id: 'due1',
  label: 'Due',
  agentId: 'a1',
  agentName: 'A',
  schedule: 'daily',
  apiKey: 'k',
  enabled: true,
  inputs: {},
  agentDefinition: { id: 'a1', name: 'A', provider: 'openai', systemPrompt: 'sys', inputs: [] },
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

describe('useScheduler dedup', () => {
  it('does not run the same job twice back to back unless forced', async () => {
    localStorage.setItem(
      'ila_scheduled_jobs',
      JSON.stringify([{ ...baseJob, nextRunAt: Date.now() - 1000 }])
    )
    const { result } = renderHook(() => useScheduler({ autoRun: false }))
    await act(async () => {
      await result.current.runJob({ ...baseJob, nextRunAt: Date.now() - 1000 })
    })
    expect(streamAgent).toHaveBeenCalledTimes(1)
    let second
    await act(async () => {
      second = await result.current.runJob({ ...baseJob, nextRunAt: Date.now() - 1000 })
    })
    expect(second).toBeNull()
    expect(streamAgent).toHaveBeenCalledTimes(1)
    await act(async () => {
      await result.current.runJob({ ...baseJob, nextRunAt: Date.now() - 1000 }, { force: true })
    })
    expect(streamAgent).toHaveBeenCalledTimes(2)
  })
})
