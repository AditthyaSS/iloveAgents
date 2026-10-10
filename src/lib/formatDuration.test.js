import { describe, it, expect } from 'vitest'
import { formatDuration } from './executionTrace'

describe('formatDuration — comprehensive edge cases', () => {
  describe('millisecond range (0 – 999ms)', () => {
    it('0ms returns 0ms', () => expect(formatDuration(0)).toBe('0ms'))
    it('1ms returns 1ms', () => expect(formatDuration(1)).toBe('1ms'))
    it('999ms returns 999ms', () => expect(formatDuration(999)).toBe('999ms'))
    it('rounds fractional ms', () => expect(formatDuration(500.7)).toBe('501ms'))
  })

  describe('second range (1s – 59.9s)', () => {
    it('exactly 1000ms → 1.0s', () => expect(formatDuration(1000)).toBe('1.0s'))
    it('1500ms → 1.5s', () => expect(formatDuration(1500)).toBe('1.5s'))
    it('59999ms → 60.0s', () => expect(formatDuration(59999)).toBe('60.0s'))
    it('10000ms → 10.0s', () => expect(formatDuration(10000)).toBe('10.0s'))
    it('2345ms → 2.3s (one decimal)', () => expect(formatDuration(2345)).toBe('2.3s'))
  })

  describe('minute range (60s+)', () => {
    it('exactly 60000ms → 1m 0s', () => expect(formatDuration(60000)).toBe('1m 0s'))
    it('90000ms → 1m 30s', () => expect(formatDuration(90000)).toBe('1m 30s'))
    it('120000ms → 2m 0s', () => expect(formatDuration(120000)).toBe('2m 0s'))
    it('3661000ms → 61m 1s', () => expect(formatDuration(3661000)).toBe('61m 1s'))
  })

  describe('invalid inputs', () => {
    it('NaN → 0ms', () => expect(formatDuration(NaN)).toBe('0ms'))
    it('Infinity → 0ms', () => expect(formatDuration(Infinity)).toBe('0ms'))
    it('-Infinity → 0ms', () => expect(formatDuration(-Infinity)).toBe('0ms'))
    it('-1 → 0ms', () => expect(formatDuration(-1)).toBe('0ms'))
    it('-999 → 0ms', () => expect(formatDuration(-999)).toBe('0ms'))
  })
})
