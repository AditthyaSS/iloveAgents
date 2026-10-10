import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSessionSpend } from './useSessionSpend'

describe('useSessionSpend clear guard', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('resets the view even when removal throws', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      const err = new Error('Access denied')
      err.name = 'SecurityError'
      throw err
    })
    const { result } = renderHook(() => useSessionSpend())
    act(() => {
      result.current.addRun({ model: 'gpt-4o-mini', inputTokens: 5, outputTokens: 5 })
    })
    expect(() => {
      act(() => {
        result.current.clearSession()
      })
    }).not.toThrow()
    expect(result.current.runs).toEqual([])
    expect(result.current.totalSpend).toBe(0)
  })
})
