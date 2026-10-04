import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { tokenEstimate, useTokenCounter } from './useTokenCounter'

describe('tokenEstimate', () => {
  it('returns zero for empty input', () => {
    expect(tokenEstimate('')).toBe(0)
    expect(tokenEstimate('   ')).toBe(0)
    expect(tokenEstimate(null)).toBe(0)
  })

  it('counts short words as single tokens', () => {
    expect(tokenEstimate('hi')).toBeGreaterThan(0)
    expect(tokenEstimate('hello world')).toBeGreaterThan(tokenEstimate('hi'))
  })

  it('scales with word length in four character chunks', () => {
    const short = tokenEstimate('abcd')
    const long = tokenEstimate('abcdefgh')
    expect(long).toBeGreaterThan(short)
  })

  it('counts multibyte characters without crashing', () => {
    expect(tokenEstimate('héllo 世界')).toBeGreaterThan(0)
  })

  it('exposes the estimator through the hook', async () => {
    const { result } = renderHook(() => useTokenCounter('hello world', 10))
    expect(result.current.tokens).toBeGreaterThanOrEqual(0)
    await new Promise((r) => setTimeout(r, 50))
    expect(result.current.tokens).toBeGreaterThan(0)
  })
})
