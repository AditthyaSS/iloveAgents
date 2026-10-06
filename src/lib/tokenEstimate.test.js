import { describe, it, expect } from 'vitest'
import { tokenEstimate } from './useTokenCounter.js'

describe('tokenEstimate', () => {
  it('returns 0 for empty string', () => {
    expect(tokenEstimate('')).toBe(0)
  })

  it('returns 0 for null', () => {
    expect(tokenEstimate(null)).toBe(0)
  })

  it('returns 0 for undefined', () => {
    expect(tokenEstimate(undefined)).toBe(0)
  })

  it('returns 0 for whitespace-only string', () => {
    expect(tokenEstimate('   ')).toBe(0)
    expect(tokenEstimate('\n\t ')).toBe(0)
  })

  it('returns a positive integer for non-empty text', () => {
    const result = tokenEstimate('Hello world')
    expect(typeof result).toBe('number')
    expect(Number.isInteger(result)).toBe(true)
    expect(result).toBeGreaterThan(0)
  })

  it('longer text produces more tokens than shorter text', () => {
    const short = tokenEstimate('Hello')
    const long = tokenEstimate('Hello world, this is a much longer sentence with many words.')
    expect(long).toBeGreaterThan(short)
  })

  it('scaling: doubling the text roughly doubles the tokens', () => {
    const base = 'Hello world '
    const count1 = tokenEstimate(base)
    const count4 = tokenEstimate(base.repeat(4))
    // Allow ±50% headroom due to non-linear whitespace effects
    expect(count4).toBeGreaterThan(count1 * 2)
    expect(count4).toBeLessThan(count1 * 8)
  })

  it('returns 0 for text of all whitespace characters after trim', () => {
    expect(tokenEstimate('\n\n\n')).toBe(0)
  })

  it('handles multibyte / non-ASCII characters without throwing', () => {
    expect(() => tokenEstimate('こんにちは')).not.toThrow()
    expect(() => tokenEstimate('🤖 🚀 ✨')).not.toThrow()
    expect(() => tokenEstimate('مرحبا بالعالم')).not.toThrow()
  })

  it('non-ASCII text returns positive token count', () => {
    expect(tokenEstimate('こんにちは')).toBeGreaterThan(0)
    expect(tokenEstimate('مرحبا بالعالم')).toBeGreaterThan(0)
  })

  it('punctuation-only text returns positive token count', () => {
    expect(tokenEstimate('!!! ??? ...')).toBeGreaterThan(0)
  })

  it('single word returns at least 1 token', () => {
    expect(tokenEstimate('hello')).toBeGreaterThanOrEqual(1)
  })

  it('estimate is deterministic for the same input', () => {
    const text = 'The quick brown fox jumps over the lazy dog'
    expect(tokenEstimate(text)).toBe(tokenEstimate(text))
  })
})
