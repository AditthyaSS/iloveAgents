import { describe, it, expect } from 'vitest'
import { computeStats } from './useAnalytics'

const day = 86400000
const now = Date.now()
const event = (overrides = {}) => ({
  id: `e_${Math.random()}`,
  agentId: 'a1',
  agentName: 'Agent One',
  provider: 'openai',
  category: 'Engineering',
  model: 'gpt-4o-mini',
  duration: 1000,
  timestamp: now,
  ...overrides,
})

describe('computeStats', () => {
  it('returns zeroed stats for empty input', () => {
    const stats = computeStats([], 'all')
    expect(stats.totalRuns).toBe(0)
    expect(stats.favoriteProvider).toBeNull()
    expect(stats.topAgents).toEqual([])
  })

  it('counts totals, agents and providers', () => {
    const stats = computeStats(
      [event(), event({ agentId: 'a2', agentName: 'Two', provider: 'anthropic' }), event()],
      'all'
    )
    expect(stats.totalRuns).toBe(3)
    expect(stats.uniqueAgents).toBe(2)
    expect(stats.favoriteProvider).toBe('openai')
    expect(stats.topAgents[0].agentId).toBe('a1')
  })

  it('filters by time range', () => {
    const stats = computeStats(
      [event({ timestamp: now - 60 * day }), event({ timestamp: now })],
      '7d'
    )
    expect(stats.totalRuns).toBe(1)
  })

  it('tracks streaks across consecutive days', () => {
    const stats = computeStats(
      [event({ timestamp: now }), event({ timestamp: now - day }), event({ timestamp: now - 2 * day })],
      'all'
    )
    expect(stats.currentStreak).toBeGreaterThanOrEqual(1)
    expect(stats.longestStreak).toBeGreaterThanOrEqual(3)
  })
})
