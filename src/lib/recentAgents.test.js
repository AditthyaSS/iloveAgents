// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getRecentAgentIds, saveRecentAgentIds } from './recentAgents'

describe('recent agent storage', () => {
  beforeEach(() => {
    const values = new Map()
    globalThis.localStorage = {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      clear: () => values.clear(),
    }
    vi.restoreAllMocks()
  })

  it('returns an empty list when stored data is malformed', () => {
    localStorage.setItem('recentAgents', '{invalid-json')

    expect(getRecentAgentIds()).toEqual([])
  })

  it('returns an empty list when stored data is not an array', () => {
    localStorage.setItem('recentAgents', JSON.stringify({ id: 'agent' }))

    expect(getRecentAgentIds()).toEqual([])
  })

  it('keeps only string agent ids', () => {
    localStorage.setItem('recentAgents', JSON.stringify(['first', 2, null, 'second']))

    expect(getRecentAgentIds()).toEqual(['first', 'second'])
  })

  it('does not throw when localStorage cannot be written', () => {
    const setItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('storage unavailable')
    })

    expect(() => saveRecentAgentIds(['agent'])).not.toThrow()
    expect(setItem).toHaveBeenCalledWith('recentAgents', '["agent"]')
  })
})
