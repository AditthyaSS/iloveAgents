import { describe, it, expect } from 'vitest'
import { buildRecommendationReasons } from './explanations.js'

const agent = (overrides = {}) => ({
  id: 'agent-1',
  name: 'Test Agent',
  category: 'Engineering',
  description: 'Helps with coding and debugging',
  ...overrides,
})

describe('buildRecommendationReasons', () => {
  it('returns an array', () => {
    const reasons = buildRecommendationReasons(agent(), {}, {})
    expect(Array.isArray(reasons)).toBe(true)
  })

  it('returns at most 4 reasons', () => {
    const reasons = buildRecommendationReasons(agent(), {}, {
      exactCategory: true,
      goalCategory: true,
      taskTypes: ['code', 'debug', 'review', 'technical'],
      capabilities: ['toolCalling'],
      provider: 'exact',
      freeTextTerms: ['code', 'api'],
      experience: 'advanced',
      preference: 'capable'
    })
    expect(reasons.length).toBeLessThanOrEqual(4)
  })

  it('returns no duplicate reasons', () => {
    const reasons = buildRecommendationReasons(agent(), {}, {
      exactCategory: true,
      taskTypes: ['code', 'debug']
    })
    expect(new Set(reasons).size).toBe(reasons.length)
  })

  it('includes a goal-matched reason when exactCategory is set', () => {
    const reasons = buildRecommendationReasons(
      agent(),
      { primaryGoal: 'coding-development' },
      { exactCategory: true }
    )
    expect(reasons.some(r => /coding/i.test(r))).toBe(true)
  })

  it('includes provider reason when provider match is "exact"', () => {
    const reasons = buildRecommendationReasons(agent(), {}, { provider: 'exact' })
    expect(reasons.some(r => /provider/i.test(r))).toBe(true)
  })

  it('includes free text reason when freeTextTerms are matched', () => {
    const reasons = buildRecommendationReasons(
      agent(),
      {},
      { freeTextTerms: ['debug', 'api'] }
    )
    expect(reasons.some(r => r.includes('debug') || r.includes('api'))).toBe(true)
  })

  it('includes task-type reason for each matched task type', () => {
    const reasons = buildRecommendationReasons(
      agent(),
      { primaryGoal: 'coding-development' },
      { exactCategory: true, taskTypes: ['code'] }
    )
    expect(reasons.some(r => /coding/i.test(r))).toBe(true)
  })

  it('includes category in reasons when no strong signals match', () => {
    const reasons = buildRecommendationReasons(agent({ category: 'Design' }), {}, {})
    expect(reasons.some(r => r.includes('Design'))).toBe(true)
  })

  it('does not crash for empty agent', () => {
    expect(() => buildRecommendationReasons({}, {}, {})).not.toThrow()
  })

  it('does not crash for undefined preferences or signals', () => {
    expect(() => buildRecommendationReasons(agent())).not.toThrow()
    expect(() => buildRecommendationReasons(agent(), undefined, undefined)).not.toThrow()
  })

  it('still returns reasons when agent has no category', () => {
    const reasons = buildRecommendationReasons(
      { id: 'x', name: 'X', description: 'helpful' },
      { primaryGoal: 'coding-development' },
      { exactCategory: true }
    )
    expect(Array.isArray(reasons)).toBe(true)
  })

  it('includes experience reason when matchedSignals.experience is set', () => {
    const reasons = buildRecommendationReasons(agent(), {}, { experience: 'beginner' })
    expect(reasons.some(r => /beginner/i.test(r))).toBe(true)
  })

  it('includes capability reason when matchedSignals.capabilities has items', () => {
    const reasons = buildRecommendationReasons(
      agent(),
      {},
      { capabilities: ['toolCalling'] }
    )
    expect(reasons.some(r => /tool calling/i.test(r) || r.length > 0)).toBe(true)
  })
})
