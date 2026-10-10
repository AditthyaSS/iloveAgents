import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSessionSpend } from './useSessionSpend'

describe('useSessionSpend load repair', () => {
  it('recomputes totals and sanitizes stored runs', () => {
    localStorage.setItem(
      'ila_session_spend',
      JSON.stringify({
        runs: [
          { model: 'm', totalCost: 1.5 },
          { model: 'm', totalCost: 'abc' },
          { model: 'm' },
          null,
        ],
        totalSpend: 999,
      })
    )
    const { result } = renderHook(() => useSessionSpend())
    expect(result.current.totalSpend).toBeCloseTo(1.5)
    expect(result.current.runs).toHaveLength(3)
  })
})
