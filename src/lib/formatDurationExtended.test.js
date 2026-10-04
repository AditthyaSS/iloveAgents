import { describe, it, expect } from 'vitest'
import { formatDuration } from './executionTrace'

describe('formatDuration — output format consistency', () => {
  it('all values in ms range end with "ms"', () => {
    const values = [0, 1, 100, 500, 999]
    for (const v of values) {
      expect(formatDuration(v).endsWith('ms')).toBe(true)
    }
  })

  it('all values in second range end with "s"', () => {
    const values = [1000, 2500, 30000, 59000]
    for (const v of values) {
      expect(formatDuration(v).endsWith('s')).toBe(true)
    }
  })

  it('all values in minute range end with "s" (e.g. "1m 30s")', () => {
    const values = [60000, 90000, 120000, 300000]
    for (const v of values) {
      expect(formatDuration(v).endsWith('s')).toBe(true)
      expect(formatDuration(v)).toContain('m ')
    }
  })

  it('never returns empty string', () => {
    const testCases = [0, 1, 1000, 60000, -1, NaN, Infinity]
    for (const v of testCases) {
      expect(formatDuration(v).length).toBeGreaterThan(0)
    }
  })

  it('returns string type always', () => {
    const testCases = [0, 500, 5000, 65000, -100, NaN]
    for (const v of testCases) {
      expect(typeof formatDuration(v)).toBe('string')
    }
  })

  it('1 minute 30 seconds = "1m 30s"', () => {
    expect(formatDuration(90_000)).toBe('1m 30s')
  })

  it('3 minutes 5 seconds', () => {
    expect(formatDuration(185_000)).toBe('3m 5s')
  })
})
