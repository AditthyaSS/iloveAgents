import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { loadRecentAgentIds, rememberRecentAgent } from './recentAgents'

const KEY = 'recentAgents'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('loadRecentAgentIds', () => {
  it('returns an empty list when nothing has been stored yet', () => {
    expect(loadRecentAgentIds()).toEqual([])
  })

  it('returns the stored ids in the order they were written', () => {
    localStorage.setItem(KEY, JSON.stringify(['code-reviewer', 'regex-generator']))
    expect(loadRecentAgentIds()).toEqual(['code-reviewer', 'regex-generator'])
  })

  it('falls back to an empty list when the stored value is not valid JSON', () => {
    // Exactly the value from the bug report: a half written / hand edited blob.
    localStorage.setItem(KEY, '{invalid-json')
    expect(() => loadRecentAgentIds()).not.toThrow()
    expect(loadRecentAgentIds()).toEqual([])
  })

  it('falls back to an empty list when the stored JSON is not an array', () => {
    for (const value of ['"a string"', '{"code-reviewer":1}', '42', 'null', 'true']) {
      localStorage.setItem(KEY, value)
      expect(loadRecentAgentIds(), `value: ${value}`).toEqual([])
    }
  })

  it('drops entries that cannot match an agent id', () => {
    localStorage.setItem(KEY, JSON.stringify(['code-reviewer', 7, null, '', { id: 'x' }]))
    expect(loadRecentAgentIds()).toEqual(['code-reviewer'])
  })

  it('keeps only the first occurrence of a repeated id', () => {
    localStorage.setItem(KEY, JSON.stringify(['a', 'b', 'a', 'c', 'a']))
    expect(loadRecentAgentIds()).toEqual(['a', 'b', 'c'])
  })

  it('caps a stored list that is longer than the rail renders', () => {
    localStorage.setItem(KEY, JSON.stringify(['a', 'b', 'c', 'd', 'e', 'f', 'g']))
    expect(loadRecentAgentIds()).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('does not throw when storage access itself is denied', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Access is denied for this document.', 'SecurityError')
    })
    expect(() => loadRecentAgentIds()).not.toThrow()
    expect(loadRecentAgentIds()).toEqual([])
  })

  it('survives an uncaught parse error from a corrupt store without leaking state', () => {
    localStorage.setItem(KEY, '["code-reviewer"]')
    expect(loadRecentAgentIds()).toEqual(['code-reviewer'])
    localStorage.setItem(KEY, '[')
    expect(loadRecentAgentIds()).toEqual([])
  })
})

describe('rememberRecentAgent', () => {
  it('writes a single id to an empty store', () => {
    expect(rememberRecentAgent('code-reviewer')).toEqual(['code-reviewer'])
    expect(JSON.parse(localStorage.getItem(KEY))).toEqual(['code-reviewer'])
  })

  it('moves an already present id to the front instead of duplicating it', () => {
    localStorage.setItem(KEY, JSON.stringify(['b', 'c', 'a']))
    expect(rememberRecentAgent('a')).toEqual(['a', 'b', 'c'])
  })

  it('keeps only the five most recent ids', () => {
    localStorage.setItem(KEY, JSON.stringify(['e', 'd', 'c', 'b', 'a']))
    expect(rememberRecentAgent('f')).toEqual(['f', 'e', 'd', 'c', 'b'])
    expect(JSON.parse(localStorage.getItem(KEY))).toHaveLength(5)
  })

  it('repairs a corrupt store instead of failing on it', () => {
    localStorage.setItem(KEY, '{invalid-json')
    expect(rememberRecentAgent('code-reviewer')).toEqual(['code-reviewer'])
    expect(JSON.parse(localStorage.getItem(KEY))).toEqual(['code-reviewer'])
  })

  it('removes duplicates of the other ids when writing', () => {
    localStorage.setItem(KEY, JSON.stringify(['a', 'b', 'a', 'c']))
    expect(rememberRecentAgent('z')).toEqual(['z', 'a', 'b', 'c'])
    expect(JSON.parse(localStorage.getItem(KEY))).toEqual(['z', 'a', 'b', 'c'])
  })

  it('reports the previous list and keeps the old value when the write is rejected', () => {
    localStorage.setItem(KEY, JSON.stringify(['code-reviewer']))
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
    })

    expect(() => rememberRecentAgent('regex-generator')).not.toThrow()
    expect(rememberRecentAgent('regex-generator')).toEqual(['code-reviewer'])
    vi.restoreAllMocks()
    expect(JSON.parse(localStorage.getItem(KEY))).toEqual(['code-reviewer'])
  })
})