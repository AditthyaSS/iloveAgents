import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAgentRatings } from './useAgentRatings'

describe('useAgentRatings numeric guards', () => {
  it('repairs corrupt counts instead of concatenating', () => {
    localStorage.clear()
    localStorage.setItem('ila_ratings', JSON.stringify({ a1: { up: '5', down: null } }))
    const { result } = renderHook(() => useAgentRatings())
    act(() => {
      result.current.rateAgent('a1', 'up')
    })
    const info = result.current.getAgentRatingInfo('a1')
    expect(info.up).toBe(6)
    expect(info.total).toBe(6)
    expect(info.percentage).toBe(100)
  })
})
