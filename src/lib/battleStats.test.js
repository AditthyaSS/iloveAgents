import { describe, it, expect } from 'vitest'
import { countWords, estimateTokens, buildBattleStats, formatCost } from './battleStats'

describe('battleStats', () => {
  it('counts words and chars', () => {
    expect(countWords('hello world')).toBe(2)
    expect(countWords('  ')).toBe(0)
    expect(countWords(null)).toBe(0)
  })

  it('estimates tokens from length', () => {
    expect(estimateTokens('abcd')).toBe(1)
    expect(estimateTokens('')).toBe(0)
  })

  it('builds stats with time and cost', () => {
    const s = buildBattleStats('hello world foo', 3200, 'gpt-4o-mini')
    expect(s.words).toBe(3)
    expect(s.seconds).toBeCloseTo(3.2)
    expect(typeof s.cost).toBe('number')
  })

  it('handles missing content', () => {
    const s = buildBattleStats(null, null, 'gpt-4o-mini')
    expect(s.words).toBe(0)
    expect(s.seconds).toBeNull()
  })

  it('formats cost', () => {
    expect(formatCost(null)).toBe('n/a')
    expect(formatCost(0.004)).toBe('$0.0040')
  })
})
