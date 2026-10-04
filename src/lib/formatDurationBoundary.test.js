import { describe, it, expect } from 'vitest'
import { formatDuration } from './executionTrace'

describe('formatDuration — exact boundary values', () => {
  describe('Just before each range transition', () => {
    it('999ms → "999ms" (still in ms range)', () => expect(formatDuration(999)).toBe('999ms'))
    it('1000ms → "1.0s" (first second value)', () => expect(formatDuration(1000)).toBe('1.0s'))
    it('59999ms → "60.0s" (last second value)', () => expect(formatDuration(59999)).toBe('60.0s'))
    it('60000ms → "1m 0s" (first minute value)', () => expect(formatDuration(60000)).toBe('1m 0s'))
  })

  describe('Important second values', () => {
    it('2000ms → "2.0s"', () => expect(formatDuration(2000)).toBe('2.0s'))
    it('3500ms → "3.5s"', () => expect(formatDuration(3500)).toBe('3.5s'))
    it('10000ms → "10.0s"', () => expect(formatDuration(10000)).toBe('10.0s'))
    it('45000ms → "45.0s"', () => expect(formatDuration(45000)).toBe('45.0s'))
  })

  describe('Important minute values', () => {
    it('61000ms → "1m 1s"', () => expect(formatDuration(61000)).toBe('1m 1s'))
    it('120000ms → "2m 0s"', () => expect(formatDuration(120000)).toBe('2m 0s'))
    it('150000ms → "2m 30s"', () => expect(formatDuration(150000)).toBe('2m 30s'))
    it('600000ms → "10m 0s"', () => expect(formatDuration(600000)).toBe('10m 0s'))
  })
})
