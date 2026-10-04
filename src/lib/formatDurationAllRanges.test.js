import { describe, it, expect } from 'vitest'
import { formatDuration } from './executionTrace'

describe('formatDuration — complete range coverage', () => {
  describe('ms range: 0–999ms', () => {
    const msCases = [0, 1, 100, 250, 500, 750, 999]
    msCases.forEach((ms) => {
      it(`${ms}ms → "${ms}ms"`, () => {
        expect(formatDuration(ms)).toBe(`${ms}ms`)
      })
    })
  })

  describe('second range: 1000ms–59999ms', () => {
    const sCases = [
      [1000, '1.0s'],
      [1500, '1.5s'],
      [2000, '2.0s'],
      [5000, '5.0s'],
      [9999, '10.0s'],
      [30000, '30.0s'],
    ]
    sCases.forEach(([ms, expected]) => {
      it(`${ms}ms → "${expected}"`, () => {
        expect(formatDuration(ms)).toBe(expected)
      })
    })
  })

  describe('minute range: 60000ms+', () => {
    const mCases = [
      [60000, '1m 0s'],
      [61000, '1m 1s'],
      [90000, '1m 30s'],
      [120000, '2m 0s'],
      [125000, '2m 5s'],
      [3600000, '60m 0s'],
    ]
    mCases.forEach(([ms, expected]) => {
      it(`${ms}ms → "${expected}"`, () => {
        expect(formatDuration(ms)).toBe(expected)
      })
    })
  })
})
