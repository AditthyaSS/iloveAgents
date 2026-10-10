import { describe, it, expect } from 'vitest'
import { saveHistoryWithPrune } from './useHistory'

function quotaStorage(limit) {
  const store = {}
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => {
      const next = { ...store, [k]: v }
      const size = JSON.stringify(next).length
      if (size > limit) {
        const err = new Error('Quota exceeded')
        err.name = 'QuotaExceededError'
        throw err
      }
      store[k] = v
    },
    _store: store,
  }
}

describe('saveHistoryWithPrune', () => {
  it('saves without pruning when under quota', () => {
    const storage = quotaStorage(100000)
    const list = [{ id: 'a' }, { id: 'b' }]
    const res = saveHistoryWithPrune(list, storage)
    expect(res.pruned).toBe(0)
    expect(res.saved).toHaveLength(2)
  })

  it('prunes oldest entries and retries on quota errors', () => {
    const storage = quotaStorage(120)
    const list = [
      { id: 'new', output: 'x'.repeat(30) },
      { id: 'old1' },
      { id: 'old2' },
      { id: 'old3' },
      { id: 'old4' },
    ]
    const res = saveHistoryWithPrune(list, storage)
    expect(res.pruned).toBeGreaterThan(0)
    expect(res.saved[0].id).toBe('new')
    expect(JSON.parse(storage._store['iloveAgents_history'])[0].id).toBe('new')
  })

  it('stops when a single run exceeds quota', () => {
    const storage = quotaStorage(10)
    const res = saveHistoryWithPrune([{ id: 'huge', output: 'x'.repeat(1000) }], storage)
    expect(res.failed).toBe(true)
  })
})
