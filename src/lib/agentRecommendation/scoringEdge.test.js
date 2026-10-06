import { describe, it, expect } from 'vitest'
import {
  scoreAgent,
  normalizeScore,
  getMaxPossibleScore,
  recommendAgents,
  tokenizeFreeText,
} from './scoring.js'
import { DEFAULT_RECOMMENDATION_WEIGHTS } from './constants.js'

describe('scoreAgent — edge cases with unusual inputs', () => {
  it('handles agent with undefined category gracefully', () => {
    const agent = { id: 'x', name: 'X', description: 'desc', category: undefined, provider: 'openai' }
    expect(() => scoreAgent(agent, { categories: ['Engineering'] })).not.toThrow()
  })

  it('handles preferences with null primaryGoal', () => {
    const agent = { id: 'x', name: 'X', description: 'desc', category: 'Engineering', provider: 'any' }
    expect(() => scoreAgent(agent, { primaryGoal: null })).not.toThrow()
  })

  it('handles agent with empty description', () => {
    const agent = { id: 'x', name: 'Code Reviewer', description: '', category: 'Engineering', provider: 'any' }
    const result = scoreAgent(agent, { categories: ['Engineering'] })
    expect(result.score).toBeGreaterThanOrEqual(0)
  })

  it('provides higher score for exact category match vs no match', () => {
    const matchingAgent = { id: 'a', name: 'X', description: 'X', category: 'Engineering', provider: 'any' }
    const nonMatchingAgent = { id: 'b', name: 'X', description: 'X', category: 'Finance', provider: 'any' }
    const prefs = { categories: ['Engineering'] }
    const matchScore = scoreAgent(matchingAgent, prefs).score
    const nonMatchScore = scoreAgent(nonMatchingAgent, prefs).score
    expect(matchScore).toBeGreaterThan(nonMatchScore)
  })
})

describe('normalizeScore — boundary conditions', () => {
  it('returns 50 for score equal to half of maxScore', () => {
    expect(normalizeScore(50, 100)).toBe(50)
  })

  it('returns 0 when maxScore is 0 (no division by zero)', () => {
    expect(normalizeScore(0, 0)).toBe(0)
    expect(normalizeScore(10, 0)).toBe(0)
  })

  it('returns an integer for non-integer inputs', () => {
    expect(Number.isInteger(normalizeScore(33, 100))).toBe(true)
    expect(Number.isInteger(normalizeScore(1, 3))).toBe(true)
  })
})

describe('getMaxPossibleScore — with various preference combos', () => {
  it('returns a higher max with more extras', () => {
    const base = getMaxPossibleScore({})
    const withExtras = getMaxPossibleScore({ extraPreferences: ['toolCalling', 'fastResponses', 'visionSupport'] })
    expect(withExtras).toBeGreaterThan(base)
  })

  it('returns a positive number for any valid goal', () => {
    const goals = ['coding-development', 'research-analysis', 'writing-content', 'automation', 'data-analysis']
    goals.forEach(goal => {
      expect(getMaxPossibleScore({ primaryGoal: goal })).toBeGreaterThan(0)
    })
  })
})

describe('recommendAgents — sort and dedup invariants', () => {
  const agents = Array.from({ length: 10 }, (_, i) => ({
    id: `agent-${i}`,
    name: `Agent ${i}`,
    category: i % 2 === 0 ? 'Engineering' : 'Marketing',
    description: `Agent ${i} description`,
    provider: 'any',
  }))

  it('returns results sorted by score descending', () => {
    const results = recommendAgents(agents, { categories: ['Engineering'] })
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score)
    }
  })

  it('all result matchPercentages are in [0, 100]', () => {
    const results = recommendAgents(agents, {})
    results.forEach(r => {
      expect(r.matchPercentage).toBeGreaterThanOrEqual(0)
      expect(r.matchPercentage).toBeLessThanOrEqual(100)
    })
  })
})

describe('tokenizeFreeText — with various input types', () => {
  it('handles text with punctuation', () => {
    const tokens = tokenizeFreeText('Build an API, debug SQL, and review code.')
    expect(tokens).toContain('build')
    expect(tokens).toContain('api')
    expect(tokens).toContain('debug')
  })

  it('handles numbers in text', () => {
    const tokens = tokenizeFreeText('Python 3 API v2 design')
    expect(tokens.some(t => /python/.test(t) || /api/.test(t) || /design/.test(t))).toBe(true)
  })

  it('all tokens are lowercase', () => {
    const tokens = tokenizeFreeText('SQL QUERIES API DESIGN')
    tokens.forEach(t => expect(t).toBe(t.toLowerCase()))
  })
})
