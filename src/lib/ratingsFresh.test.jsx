import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAgentRatings } from './useAgentRatings'

describe('useAgentRatings freshness', () => {
  it('reads the just-written vote in the same tick', () => {
    localStorage.clear()
    const { result } = renderHook(() => useAgentRatings())
    act(() => {
      result.current.rateAgent('a1', 'up')
    })
    const info = result.current.getAgentRatingInfo('a1')
    expect(info.up).toBe(1)
    expect(info.total).toBe(1)
    expect(info.percentage).toBe(100)
  })
})
