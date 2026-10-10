import { describe, it, expect, beforeEach } from 'vitest'
import { computeStats } from './useAnalytics.js'

const makeEvent = (overrides = {}) => ({
  id: `evt_${Math.random().toString(36).slice(2)}`,
  agentId: 'code-reviewer',
  agentName: 'Code Reviewer',
  category: 'Engineering',
  provider: 'openai',
  model: 'gpt-4o',
  duration: 1200,
  timestamp: Date.now(),
  ...overrides,
})

const daysAgo = (n) => Date.now() - n * 86400000

describe('computeStats — empty input', () => {
  it('returns zero/null defaults for an empty events array', () => {
    const stats = computeStats([])
    expect(stats.totalRuns).toBe(0)
    expect(stats.uniqueAgents).toBe(0)
    expect(stats.favoriteProvider).toBeNull()
    expect(stats.currentStreak).toBe(0)
    expect(stats.longestStreak).toBe(0)
    expect(stats.avgRunsPerDay).toBe(0)
    expect(stats.mostProductiveDay).toBeNull()
    expect(stats.topAgents).toEqual([])
    expect(stats.providerDistribution).toEqual([])
    expect(stats.categoryDistribution).toEqual([])
  })
})

describe('computeStats — basic counts', () => {
  it('counts totalRuns correctly', () => {
    const events = [makeEvent(), makeEvent(), makeEvent()]
    expect(computeStats(events).totalRuns).toBe(3)
  })

  it('counts uniqueAgents correctly', () => {
    const events = [
      makeEvent({ agentId: 'a1' }),
      makeEvent({ agentId: 'a1' }),
      makeEvent({ agentId: 'a2' }),
    ]
    expect(computeStats(events).uniqueAgents).toBe(2)
  })
})

describe('computeStats — provider distribution', () => {
  it('identifies the favorite provider', () => {
    const events = [
      makeEvent({ provider: 'openai' }),
      makeEvent({ provider: 'openai' }),
      makeEvent({ provider: 'anthropic' }),
    ]
    const stats = computeStats(events)
    expect(stats.favoriteProvider).toBe('openai')
  })

  it('includes percentages in provider distribution', () => {
    const events = [
      makeEvent({ provider: 'openai' }),
      makeEvent({ provider: 'anthropic' }),
    ]
    const stats = computeStats(events)
    const total = stats.providerDistribution.reduce((s, p) => s + p.pct, 0)
    expect(total).toBeGreaterThanOrEqual(99) // rounding may cause 99 or 101
    expect(total).toBeLessThanOrEqual(101)
  })

  it('defaults missing provider to "unknown"', () => {
    const events = [makeEvent({ provider: undefined })]
    const stats = computeStats(events)
    expect(stats.providerDistribution.some(p => p.name === 'unknown')).toBe(true)
  })
})

describe('computeStats — top agents', () => {
  it('ranks agents by run count', () => {
    const events = [
      makeEvent({ agentId: 'a1', agentName: 'A1' }),
      makeEvent({ agentId: 'a2', agentName: 'A2' }),
      makeEvent({ agentId: 'a1', agentName: 'A1' }),
    ]
    const stats = computeStats(events)
    expect(stats.topAgents[0].agentId).toBe('a1')
    expect(stats.topAgents[0].count).toBe(2)
  })

  it('caps top agents at 8', () => {
    const events = Array.from({ length: 20 }, (_, i) =>
      makeEvent({ agentId: `agent-${i}`, agentName: `Agent ${i}` })
    )
    const stats = computeStats(events)
    expect(stats.topAgents.length).toBeLessThanOrEqual(8)
  })
})

describe('computeStats — range filtering', () => {
  it('includes all events for "all" range', () => {
    const events = [
      makeEvent({ timestamp: daysAgo(100) }),
      makeEvent({ timestamp: daysAgo(10) }),
      makeEvent({ timestamp: daysAgo(1) }),
    ]
    expect(computeStats(events, 'all').totalRuns).toBe(3)
  })

  it('excludes events outside 7d range', () => {
    const events = [
      makeEvent({ timestamp: daysAgo(8) }),
      makeEvent({ timestamp: daysAgo(3) }),
      makeEvent({ timestamp: daysAgo(1) }),
    ]
    const stats = computeStats(events, '7d')
    expect(stats.totalRuns).toBe(2) // only the 3d and 1d events
  })

  it('returns zero stats when no events fall in the range', () => {
    const events = [makeEvent({ timestamp: daysAgo(35) })]
    const stats = computeStats(events, '7d')
    expect(stats.totalRuns).toBe(0)
  })
})

describe('computeStats — averages', () => {
  it('calculates avgRunsPerDay over active days', () => {
    // 4 events on 2 distinct days → avg = 2
    const t = Date.now()
    const events = [
      makeEvent({ timestamp: t }),
      makeEvent({ timestamp: t }),
      makeEvent({ timestamp: daysAgo(2) }),
      makeEvent({ timestamp: daysAgo(2) }),
    ]
    const stats = computeStats(events)
    expect(stats.avgRunsPerDay).toBe(2)
  })
})

describe('computeStats — result shape', () => {
  it('always includes all required keys', () => {
    const requiredKeys = [
      'totalRuns', 'uniqueAgents', 'favoriteProvider',
      'currentStreak', 'longestStreak', 'avgRunsPerDay',
      'mostProductiveDay', 'topAgents', 'providerDistribution',
      'categoryDistribution', 'dailyRuns', 'heatmapData', 'recentRuns',
    ]
    const stats = computeStats([makeEvent()])
    requiredKeys.forEach(key => expect(stats).toHaveProperty(key))
  })

  it('dailyRuns has 30 entries when events exist', () => {
    expect(computeStats([makeEvent()]).dailyRuns.length).toBe(30)
  })

  it('heatmapData has 84 entries when events exist', () => {
    expect(computeStats([makeEvent()]).heatmapData.length).toBe(84)
  })
})
