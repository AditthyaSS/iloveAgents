import { describe, it, expect, beforeEach } from 'vitest'
import { loadRecentIds, recordRecentVisit, MAX_RECENT_AGENTS } from './recentAgents'

function quotaStorage(limit) {
  const store = {}
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => {
      const next = { ...store, [k]: v }
      if (JSON.stringify(next).length > limit) {
        const err = new Error('Quota exceeded')
        err.name = 'QuotaExceededError'
        throw err
      }
      store[k] = v
    },
    _store: store,
  }
}

describe('recentAgents', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('falls back to empty on malformed data', () => {
    localStorage.setItem('recentAgents', 'not-json')
    expect(loadRecentIds()).toEqual([])
  })

  it('ignores non array payloads', () => {
    localStorage.setItem('recentAgents', '{"a":1}')
    expect(loadRecentIds()).toEqual([])
  })

  it('records visits newest first capped at five', () => {
    for (const id of ['a', 'b', 'c', 'd', 'e', 'f']) {
      recordRecentVisit(id)
    }
    expect(JSON.parse(localStorage.getItem('recentAgents'))).toHaveLength(MAX_RECENT_AGENTS)
    expect(JSON.parse(localStorage.getItem('recentAgents'))[0]).toBe('f')
    recordRecentVisit('c')
    expect(JSON.parse(localStorage.getItem('recentAgents'))[0]).toBe('c')
  })

  it('prunes on quota errors instead of throwing', () => {
    const storage = quotaStorage(90)
    const ids = recordRecentVisit('new-agent-with-a-long-id', storage)
    expect(() => recordRecentVisit('another-long-agent-id-here', storage)).not.toThrow()
    expect(ids).toContain('new-agent-with-a-long-id')
  })
})
