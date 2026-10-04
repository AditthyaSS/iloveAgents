import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScheduler } from './useScheduler'

function failWrites() {
  return vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    const err = new Error('Quota exceeded')
    err.name = 'QuotaExceededError'
    throw err
  })
}

describe('useScheduler storage failure', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('toggles jobs without throwing when writes fail', () => {
    localStorage.setItem(
      'ila_scheduled_jobs',
      JSON.stringify([{ id: 'j1', label: 'Daily', enabled: true, schedule: 'daily', agentDefinition: null }])
    )
    failWrites()
    const { result } = renderHook(() => useScheduler({ autoRun: false }))
    expect(() => {
      act(() => {
        result.current.toggleJob('j1')
      })
    }).not.toThrow()
    expect(result.current.jobs.find((j) => j.id === 'j1').enabled).toBe(false)
  })

  it('keeps session results when result writes fail', () => {
    failWrites()
    const { result } = renderHook(() => useScheduler({ autoRun: false }))
    expect(result.current.jobs).toEqual([])
    expect(result.current.results).toEqual([])
  })
})
