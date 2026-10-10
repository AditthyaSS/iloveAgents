import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCollections, saveCollections } from './useCollections'

function quotaLimit(limit) {
  const original = Storage.prototype.setItem
  return vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (k, v) {
    if (String(v).length > limit) {
      const err = new Error('Quota exceeded')
      err.name = 'QuotaExceededError'
      throw err
    }
    return original.call(this, k, v)
  })
}

describe('collections storage failure', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reports failure instead of throwing when writes fail', () => {
    quotaLimit(10)
    let result
    expect(() => {
      result = saveCollections([{ id: 'c1', name: 'Work', agentIds: [] }])
    }).not.toThrow()
    expect(result.ok).toBe(false)
  })

  it('keeps the in memory update and flags storage errors on create', () => {
    quotaLimit(10)
    const { result } = renderHook(() => useCollections())
    let created
    act(() => {
      created = result.current.createCollection('Work')
    })
    expect(created.ok).toBe(true)
    expect(created.persisted).toBe(false)
    expect(created.storageError).toMatch(/full/i)
    expect(result.current.collections.some((c) => c.name === 'Work')).toBe(true)
  })

  it('creates normally when storage works', () => {
    const { result } = renderHook(() => useCollections())
    let created
    act(() => {
      created = result.current.createCollection('Work')
    })
    expect(created.ok).toBe(true)
    expect(created.persisted).not.toBe(false)
  })
})
