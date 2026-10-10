import { describe, it, expect, beforeEach } from 'vitest'
import { recordAnalyticsRun } from './useAnalytics'

beforeEach(() => {
  localStorage.clear()
})

describe('recordAnalyticsRun guards', () => {
  it('ignores runs without an agent id', () => {
    expect(recordAnalyticsRun({ agentId: undefined, agentName: 'X' })).toBe(false)
    expect(recordAnalyticsRun({ agentId: '  ', agentName: 'X' })).toBe(false)
    expect(JSON.parse(localStorage.getItem('ila_analytics') || '[]')).toEqual([])
  })

  it('records valid runs', () => {
    expect(
      recordAnalyticsRun({ agentId: 'a1', agentName: 'A', provider: 'openai' })
    ).toBe(true)
    const stored = JSON.parse(localStorage.getItem('ila_analytics'))
    expect(stored).toHaveLength(1)
    expect(stored[0].agentId).toBe('a1')
  })
})
