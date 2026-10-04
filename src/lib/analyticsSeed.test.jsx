import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAnalytics } from './useAnalytics'

function blockStorage() {
  const err = () => {
    const e = new Error('Access denied')
    e.name = 'SecurityError'
    throw e
  }
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(err)
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(err)
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(err)
}

describe('useAnalytics blocked storage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('mounts with empty stats instead of throwing', () => {
    blockStorage()
    let hook
    expect(() => {
      const rendered = renderHook(() => useAnalytics())
      hook = rendered.result
    }).not.toThrow()
    expect(hook.current.stats.totalRuns).toBe(0)
  })
})
