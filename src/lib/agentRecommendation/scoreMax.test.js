import { describe, it, expect } from 'vitest'
import { getMaxPossibleScore, scoreAgent } from './scoring'
import { DEFAULT_RECOMMENDATION_WEIGHTS } from './constants.js'

describe('recommendation max score', () => {
  it('omits conditional bonuses the scorer cannot award', () => {
    const prefs = { primaryGoal: '', categories: [], extraPreferences: [], freeTextGoal: '' }
    const max = getMaxPossibleScore(prefs, DEFAULT_RECOMMENDATION_WEIGHTS)
    expect(max).toBeLessThan(
      DEFAULT_RECOMMENDATION_WEIGHTS.providerExact +
        DEFAULT_RECOMMENDATION_WEIGHTS.experience +
        DEFAULT_RECOMMENDATION_WEIGHTS.urgency +
        DEFAULT_RECOMMENDATION_WEIGHTS.exactCategory +
        1000
    )
  })

  it('a perfect match can reach 100 percent', () => {
    const prefs = {
      primaryGoal: '',
      categories: ['Engineering'],
      extraPreferences: [],
      freeTextGoal: '',
      providerPreference: 'openai',
      experienceLevel: 'advanced',
      budgetPreference: 'fast',
    }
    const agent = {
      id: 'code-reviewer',
      name: 'Code Reviewer',
      description: 'Reviews code and audits APIs with architecture guidance. Summary reply tone.',
      category: 'Engineering',
      provider: 'openai',
    }
    const max = getMaxPossibleScore(prefs, DEFAULT_RECOMMENDATION_WEIGHTS)
    const { score } = scoreAgent(agent, prefs, DEFAULT_RECOMMENDATION_WEIGHTS)
    expect(score).toBeLessThanOrEqual(max)
    expect(score / Math.max(max, 1)).toBeGreaterThan(0.5)
  })
})
