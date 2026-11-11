import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAgentRatings } from './useAgentRatings'

describe('useAgentRatings one vote per user', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('counts a first vote once', () => {
    const { result } = renderHook(() => useAgentRatings())
    act(() => {
      result.current.rateAgent('a1', 'up')
    })
    expect(result.current.getAgentRatingInfo('a1')).toMatchObject({ up: 1, down: 0, total: 1 })
    expect(result.current.getUserVote('a1')).toBe('up')
  })

  it('toggles off a repeated vote instead of double counting', () => {
    const { result } = renderHook(() => useAgentRatings())
    act(() => {
      result.current.rateAgent('a1', 'up')
    })
    act(() => {
      result.current.rateAgent('a1', 'up')
    })
    expect(result.current.getAgentRatingInfo('a1')).toMatchObject({ up: 0, total: 0 })
    expect(result.current.getUserVote('a1')).toBeNull()
  })

  it('moves the point when switching sides', () => {
    const { result } = renderHook(() => useAgentRatings())
    act(() => {
      result.current.rateAgent('a1', 'up')
    })
    act(() => {
      result.current.rateAgent('a1', 'down')
    })
    expect(result.current.getAgentRatingInfo('a1')).toMatchObject({ up: 0, down: 1, total: 1 })
    expect(result.current.getUserVote('a1')).toBe('down')
  })

  it('ignores invalid values and missing ids', () => {
    const { result } = renderHook(() => useAgentRatings())
    act(() => {
      result.current.rateAgent('a1', 'maybe')
      result.current.rateAgent(null, 'up')
    })
    expect(result.current.getAgentRatingInfo('a1')).toMatchObject({ up: 0, down: 0, total: 0 })
  })
})
