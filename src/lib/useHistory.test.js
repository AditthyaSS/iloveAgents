import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadHistory, saveHistory, STORAGE_KEY } from './useHistory'

describe('useHistory storage quota management', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('loads empty array when localStorage is empty or corrupt', () => {
    expect(loadHistory()).toEqual([])

    localStorage.setItem(STORAGE_KEY, 'invalid json {')
    expect(loadHistory()).toEqual([])
  })

  it('saves history to localStorage successfully under quota', () => {
    const runs = [
      { id: '1', agentId: 'agent-1', timestamp: 1000 },
      { id: '2', agentId: 'agent-2', timestamp: 2000 },
    ]
    const saved = saveHistory(runs)
    expect(saved).toEqual(runs)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual(runs)
  })

  it('automatically prunes oldest entries when QuotaExceededError is thrown', () => {
    const runs = [
      { id: '3', agentId: 'newest', data: 'recent' },
      { id: '2', agentId: 'middle', data: 'older' },
      { id: '1', agentId: 'oldest', data: 'oldest' },
    ]

    let callCount = 0
    const realSetItem = localStorage.setItem.bind(localStorage)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, val) => {
      callCount++
      // Throw quota error on first call (with 3 items), allow on second call (pruned)
      if (callCount === 1) {
        const quotaError = new Error('The quota has been exceeded')
        quotaError.name = 'QuotaExceededError'
        quotaError.code = 22
        throw quotaError
      }
      return realSetItem(key, val)
    })

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const result = saveHistory(runs)

    expect(warnSpy).toHaveBeenCalled()
    // Should have pruned the oldest entry (id: 1) and saved the remaining two
    expect(result.length).toBe(2)
    expect(result[0].id).toBe('3')
    expect(result[1].id).toBe('2')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual(result)
  })

  it('handles general write errors without throwing', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Access denied')
    })
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const runs = [{ id: '1', agentId: 'agent-1' }]
    const result = saveHistory(runs)

    expect(errorSpy).toHaveBeenCalled()
    expect(result).toEqual(runs)
  })
})
