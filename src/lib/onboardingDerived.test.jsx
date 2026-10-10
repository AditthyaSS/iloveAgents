import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOnboarding } from './useOnboarding'

describe('useOnboarding state', () => {
  it('keeps completion and activity consistent', () => {
    localStorage.clear()
    window.innerWidth = 1024
    const { result } = renderHook(() => useOnboarding())
    act(() => {
      result.current.endTour()
    })
    expect(result.current.hasCompletedTour).toBe(true)
    expect(result.current.isTourActive).toBe(false)
    act(() => {
      result.current.startTour()
    })
    expect(result.current.hasCompletedTour).toBe(false)
    expect(result.current.isTourActive).toBe(true)
  })
})
