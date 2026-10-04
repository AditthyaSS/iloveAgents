import { describe, it, expect, beforeEach } from 'vitest'
import { BACKUP_KEYS, collectBackup, validateBackup, restoreBackup } from './appBackup'

function memoryStorage(initial = {}) {
  const store = { ...initial }
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => {
      store[k] = v
    },
    _store: store,
  }
}

describe('appBackup', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('collects only known keys', () => {
    localStorage.setItem('ila_favorites', '["a"]')
    localStorage.setItem('random_key', 'x')
    const out = collectBackup(localStorage)
    expect(out.app).toBe('iloveAgents')
    expect(out.data['ila_favorites']).toBe('["a"]')
    expect(out.data['random_key']).toBeUndefined()
  })

  it('rejects malformed backups', () => {
    expect(validateBackup(null).ok).toBe(false)
    expect(validateBackup({}).ok).toBe(false)
    expect(validateBackup({ data: {} }).ok).toBe(false)
  })

  it('ignores unknown keys and non-string values', () => {
    const res = validateBackup({
      data: {
        ila_favorites: '["a"]',
        evil: 'x',
        ila_ratings: 123,
      },
    })
    expect(res.ok).toBe(true)
    expect(res.data['ila_favorites']).toBe('["a"]')
    expect(res.data['evil']).toBeUndefined()
    expect(res.data['ila_ratings']).toBeUndefined()
  })

  it('restores clean data without touching other keys', () => {
    const mem = memoryStorage({ keep: '1' })
    const n = restoreBackup({ ila_favorites: '["a"]', evil: 'x' }, mem)
    expect(n).toBe(1)
    expect(mem._store['ila_favorites']).toBe('["a"]')
    expect(mem._store['evil']).toBeUndefined()
  })

  it('lists expected keys and excludes session keys', () => {
    expect(BACKUP_KEYS).toContain('ila_favorites')
    expect(BACKUP_KEYS).not.toContain('ila_apikey_openai')
  })
})
