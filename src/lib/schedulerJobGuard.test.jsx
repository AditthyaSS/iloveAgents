import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScheduler } from './useScheduler'
import { streamAgent } from './llmAdapter'

vi.mock('./llmAdapter', () => ({
  streamAgent: vi.fn(),
}))
vi.mock('./useAnalytics', () => ({
  recordAnalyticsRun: vi.fn(() => true),
}))

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

describe('useScheduler corrupt jobs', () => {
  it('records a clear failure instead of crashing on legacy jobs', async () => {
    const { result } = renderHook(() => useScheduler({ autoRun: false }))
    let outcome
    await act(async () => {
      outcome = await result.current.runJob({
        id: 'legacy1',
        label: 'Legacy',
        agentId: 'a1',
        agentName: 'A',
        schedule: 'daily',
        apiKey: 'k',
        inputs: null,
      })
    })
    expect(outcome.error).toMatch(/missing or corrupt/i)
    expect(result.current.results).toHaveLength(1)
  })
})
