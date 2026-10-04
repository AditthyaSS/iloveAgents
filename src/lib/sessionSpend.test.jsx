import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSessionSpend } from './useSessionSpend'

describe('useSessionSpend', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('derives costs from tokens with a known model', () => {
    const { result } = renderHook(() => useSessionSpend())
    act(() => {
      result.current.addRun({ model: 'gpt-4o-mini', inputTokens: 1000, outputTokens: 1000 })
    })
    expect(result.current.runs).toHaveLength(1)
    expect(result.current.runs[0].totalCost).toBeGreaterThan(0)
    expect(result.current.totalSpend).toBe(result.current.runs[0].totalCost)
  })

  it('keeps explicit costs when provided', () => {
    const { result } = renderHook(() => useSessionSpend())
    act(() => {
      result.current.addRun({ model: 'x', inputTokens: 10, outputTokens: 10, inputCost: 0.5, outputCost: 0.25 })
    })
    expect(result.current.runs[0].totalCost).toBeCloseTo(0.75)
  })

  it('caps stored runs at 200 entries', () => {
    const { result } = renderHook(() => useSessionSpend())
    act(() => {
      for (let i = 0; i < 205; i++) {
        result.current.addRun({ model: 'gpt-4o-mini', inputTokens: 1, outputTokens: 1 })
      }
    })
    expect(result.current.runs).toHaveLength(200)
    expect(result.current.runs[0].inputTokens).toBe(1)
  })

  it('clears the session', () => {
    const { result } = renderHook(() => useSessionSpend())
    act(() => {
      result.current.addRun({ model: 'gpt-4o-mini', inputTokens: 5, outputTokens: 5 })
    })
    act(() => {
      result.current.clearSession()
    })
    expect(result.current.runs).toEqual([])
    expect(result.current.totalSpend).toBe(0)
  })

  it('merges concurrent writes instead of dropping them', () => {
    const first = renderHook(() => useSessionSpend())
    const second = renderHook(() => useSessionSpend())
    act(() => {
      first.result.current.addRun({ model: 'gpt-4o-mini', inputTokens: 2, outputTokens: 2 })
    })
    act(() => {
      second.result.current.addRun({ model: 'gpt-4o-mini', inputTokens: 3, outputTokens: 3 })
    })
    const stored = JSON.parse(localStorage.getItem('ila_session_spend'))
    expect(stored.runs).toHaveLength(2)
  })
})
