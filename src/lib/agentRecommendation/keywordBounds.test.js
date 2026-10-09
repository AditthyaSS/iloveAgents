import { describe, it, expect } from 'vitest'
import { matchesKeyword, scoreAgent } from './scoring'
import { DEFAULT_RECOMMENDATION_WEIGHTS } from './constants.js'

describe('matchesKeyword', () => {
  it('rejects substring false positives for short terms', () => {
    expect(matchesKeyword('an explanation of tone', 'plan')).toBe(false)
    expect(matchesKeyword('milestone tracker', 'tone')).toBe(false)
    expect(matchesKeyword('encode video', 'code')).toBe(false)
  })

  it('still matches whole words', () => {
    expect(matchesKeyword('a solid plan', 'plan')).toBe(true)
    expect(matchesKeyword('writes code daily', 'code')).toBe(true)
    expect(matchesKeyword('architecture review', 'architecture')).toBe(true)
  })
})

describe('experience scoring', () => {
  it('does not award advanced points for mere substrings', () => {
    const agent = {
      id: 'writer', name: 'Writer', description: 'Writes explanations with a steady tone.',
      category: 'Writing', provider: 'openai',
    }
    const prefs = { experienceLevel: 'advanced', providerPreference: 'any', budgetPreference: 'balanced' }
    const { matchedSignals } = scoreAgent(agent, prefs, DEFAULT_RECOMMENDATION_WEIGHTS)
    expect(matchedSignals.experience).toBeUndefined()
  })
})
