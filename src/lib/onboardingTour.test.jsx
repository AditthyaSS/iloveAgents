import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOnboarding } from './useOnboarding'

describe('useOnboarding', () => {
  const realInnerWidth = window.innerWidth

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(window, 'innerWidth', { value: realInnerWidth, configurable: true })
  })

  function setWidth(px) {
    Object.defineProperty(window, 'innerWidth', { value: px, configurable: true })
  }

  it('auto starts on first desktop visit', () => {
    setWidth(1280)
    const { result } = renderHook(() => useOnboarding())
    expect(result.current.isTourActive).toBe(true)
  })

  it('suppresses auto start on small screens', () => {
    setWidth(500)
    const { result } = renderHook(() => useOnboarding())
    expect(result.current.isTourActive).toBe(false)
  })

  it('stays quiet after completion and restarts on reset', () => {
    setWidth(1280)
    const { result } = renderHook(() => useOnboarding())
    act(() => {
      result.current.endTour()
    })
    expect(result.current.isTourActive).toBe(false)
    expect(result.current.hasCompletedTour).toBe(true)
    act(() => {
      result.current.resetTour()
    })
    expect(result.current.isTourActive).toBe(true)
  })

  it('starts explicitly on demand', () => {
    setWidth(500)
    const { result } = renderHook(() => useOnboarding())
    act(() => {
      result.current.startTour()
    })
    expect(result.current.isTourActive).toBe(true)
  })
})
