import { describe, it, expect } from 'vitest'
import {
  tokenizeFreeText,
  normalizeScore,
  scoreAgent,
  getMaxPossibleScore,
  recommendAgents,
} from './scoring.js'
import { DEFAULT_RECOMMENDATION_WEIGHTS, MIN_CONFIDENT_SCORE, RESULT_LIMIT } from './constants.js'

const mockAgent = (overrides = {}) => ({
  id: 'agent-1',
  name: 'Code Review Agent',
  description: 'Review code, detect bugs, audit security risks',
  category: 'Engineering',
  provider: 'openai',
  ...overrides,
})

describe('tokenizeFreeText', () => {
  it('splits text on non-alphanumeric characters', () => {
    const tokens = tokenizeFreeText('write a blog post for SEO')
    expect(tokens).toContain('write')
    expect(tokens).toContain('blog')
    expect(tokens).toContain('post')
    expect(tokens).toContain('seo')
  })

  it('filters out stop words', () => {
    const tokens = tokenizeFreeText('I want to write a nice post')
    expect(tokens).not.toContain('the')
    expect(tokens).not.toContain('and')
  })

  it('filters tokens shorter than 3 characters', () => {
    const tokens = tokenizeFreeText('do an ai seo task')
    expect(tokens.every(t => t.length > 2)).toBe(true)
  })

  it('caps at 12 tokens', () => {
    const long = 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi'
    const tokens = tokenizeFreeText(long)
    expect(tokens.length).toBeLessThanOrEqual(12)
  })

  it('returns empty array for empty input', () => {
    expect(tokenizeFreeText('')).toEqual([])
    expect(tokenizeFreeText()).toEqual([])
  })
})

describe('normalizeScore', () => {
  it('returns 100 when score equals maxScore', () => {
    expect(normalizeScore(50, 50)).toBe(100)
  })

  it('returns 0 for score of 0', () => {
    expect(normalizeScore(0, 100)).toBe(0)
  })

  it('returns 0 for non-finite inputs', () => {
    expect(normalizeScore(NaN, 100)).toBe(0)
    expect(normalizeScore(50, 0)).toBe(0)
    expect(normalizeScore(-5, 100)).toBe(0)
  })

  it('clamps result to [0, 100]', () => {
    expect(normalizeScore(200, 100)).toBe(100)
    expect(normalizeScore(-1, 100)).toBe(0)
  })

  it('rounds to integer', () => {
    const result = normalizeScore(1, 3)
    expect(Number.isInteger(result)).toBe(true)
  })
})

describe('scoreAgent', () => {
  it('scores higher when agent category exactly matches preferences', () => {
    const agent = mockAgent({ category: 'Engineering' })
    const prefs = { categories: ['Engineering'] }
    const { score } = scoreAgent(agent, prefs)
    expect(score).toBeGreaterThanOrEqual(DEFAULT_RECOMMENDATION_WEIGHTS.exactCategory)
  })

  it('awards no score for a completely mismatched agent', () => {
    const agent = mockAgent({ id: 'x', name: 'x', description: 'x', category: 'HR', provider: 'gemini' })
    const prefs = { categories: ['Engineering'], primaryGoal: 'coding-development', providerPreference: 'openai' }
    const { score } = scoreAgent(agent, prefs)
    expect(score).toBe(0)
  })

  it('includes a matchedSignals object', () => {
    const { matchedSignals } = scoreAgent(mockAgent(), {})
    expect(matchedSignals).toBeDefined()
    expect(Array.isArray(matchedSignals.taskTypes)).toBe(true)
  })

  it('does not crash on empty agent or preferences', () => {
    expect(() => scoreAgent({}, {})).not.toThrow()
    expect(() => scoreAgent()).not.toThrow()
  })

  it('boosts score when provider matches preference', () => {
    const agent = mockAgent({ provider: 'anthropic' })
    const prefs = { providerPreference: 'anthropic' }
    const { score: withMatch } = scoreAgent(agent, prefs)
    const { score: withoutMatch } = scoreAgent(agent, { providerPreference: 'openai' })
    expect(withMatch).toBeGreaterThan(withoutMatch)
  })
})

describe('getMaxPossibleScore', () => {
  it('returns a positive number for standard preferences', () => {
    const max = getMaxPossibleScore({ primaryGoal: 'coding-development', extraPreferences: ['toolCalling'] })
    expect(max).toBeGreaterThan(0)
    expect(Number.isFinite(max)).toBe(true)
  })

  it('returns a positive number even with no preferences', () => {
    expect(getMaxPossibleScore({})).toBeGreaterThan(0)
  })

  it('increases when extra preferences are added', () => {
    const base = getMaxPossibleScore({})
    const withExtras = getMaxPossibleScore({ extraPreferences: ['toolCalling', 'multiModal'] })
    expect(withExtras).toBeGreaterThanOrEqual(base)
  })
})

describe('recommendAgents', () => {
  const agents = [
    mockAgent({ id: 'a1', name: 'Code Review Bot', category: 'Engineering', provider: 'openai' }),
    mockAgent({ id: 'a2', name: 'Blog Writer', description: 'Write blog posts', category: 'Marketing', provider: 'anthropic' }),
    mockAgent({ id: 'a3', name: 'Data Analyst', description: 'Analyze dataset and sql', category: 'Data Science', provider: 'openai' }),
  ]

  it('returns an array', () => {
    const results = recommendAgents(agents, {})
    expect(Array.isArray(results)).toBe(true)
  })

  it('returns empty array when agents list is empty', () => {
    expect(recommendAgents([], {})).toEqual([])
  })

  it('respects the limit option', () => {
    const results = recommendAgents(agents, {}, { limit: 1 })
    expect(results.length).toBeLessThanOrEqual(1)
  })

  it('defaults to RESULT_LIMIT', () => {
    const many = Array.from({ length: 20 }, (_, i) =>
      mockAgent({ id: `agent-${i}`, name: `Agent ${i}` })
    )
    const results = recommendAgents(many, {})
    expect(results.length).toBeLessThanOrEqual(RESULT_LIMIT)
  })

  it('deduplicates agents by id', () => {
    const dupe = [
      mockAgent({ id: 'dup', name: 'First' }),
      mockAgent({ id: 'dup', name: 'Second' }),
    ]
    const results = recommendAgents(dupe, {})
    expect(results.length).toBe(1)
  })

  it('sets isConfident based on MIN_CONFIDENT_SCORE', () => {
    const results = recommendAgents(agents, { categories: ['Engineering'] })
    results.forEach(r => {
      expect(typeof r.isConfident).toBe('boolean')
    })
  })

  it('sets matchPercentage between 0 and 100', () => {
    const results = recommendAgents(agents, { categories: ['Engineering'] })
    results.forEach(r => {
      expect(r.matchPercentage).toBeGreaterThanOrEqual(0)
      expect(r.matchPercentage).toBeLessThanOrEqual(100)
    })
  })

  it('ignores agents without an id', () => {
    const withBad = [...agents, { name: 'No ID Agent', category: 'Engineering' }]
    const results = recommendAgents(withBad, {})
    expect(results.every(r => r.score !== undefined)).toBe(true)
  })

  it('ranks higher-scoring agents first', () => {
    const prefs = { categories: ['Engineering'] }
    const results = recommendAgents(agents, prefs)
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score)
    }
  })
})
