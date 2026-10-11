import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadRecentAgentIds,
  rememberRecentAgent,
  RECENT_AGENTS_STORAGE_KEY,
  MAX_RECENT_AGENTS,
} from './recentAgents'

describe('recentAgents', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('loadRecentAgentIds', () => {
    it('returns empty array when key does not exist', () => {
      expect(loadRecentAgentIds()).toEqual([])
    })

    it('returns empty array when key is empty string', () => {
      localStorage.setItem(RECENT_AGENTS_STORAGE_KEY, '')
      expect(loadRecentAgentIds()).toEqual([])
    })

    it('returns empty array when key contains malformed JSON', () => {
      localStorage.setItem(RECENT_AGENTS_STORAGE_KEY, '{invalid-json')
      expect(loadRecentAgentIds()).toEqual([])
    })

    it('returns empty array when key contains a JSON object instead of an array', () => {
      localStorage.setItem(RECENT_AGENTS_STORAGE_KEY, JSON.stringify({ 'code-reviewer': true }))
      expect(loadRecentAgentIds()).toEqual([])
    })

    it('returns empty array when key contains primitive values', () => {
      localStorage.setItem(RECENT_AGENTS_STORAGE_KEY, '123')
      expect(loadRecentAgentIds()).toEqual([])

      localStorage.setItem(RECENT_AGENTS_STORAGE_KEY, 'true')
      expect(loadRecentAgentIds()).toEqual([])

      localStorage.setItem(RECENT_AGENTS_STORAGE_KEY, '"just-a-string"')
      expect(loadRecentAgentIds()).toEqual([])

      localStorage.setItem(RECENT_AGENTS_STORAGE_KEY, 'null')
      expect(loadRecentAgentIds()).toEqual([])
    })

    it('returns empty array when localStorage getItem throws an error', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Access denied')
      })
      expect(loadRecentAgentIds()).toEqual([])
    })

    it('filters out non-string, empty, or whitespace-only elements', () => {
      localStorage.setItem(
        RECENT_AGENTS_STORAGE_KEY,
        JSON.stringify(['agent-1', null, 42, '', '   ', { id: 'x' }, 'agent-2'])
      )
      expect(loadRecentAgentIds()).toEqual(['agent-1', 'agent-2'])
    })

    it('returns valid array of IDs intact', () => {
      localStorage.setItem(
        RECENT_AGENTS_STORAGE_KEY,
        JSON.stringify(['agent-a', 'agent-b'])
      )
      expect(loadRecentAgentIds()).toEqual(['agent-a', 'agent-b'])
    })
  })

  describe('rememberRecentAgent', () => {
    it('adds a new agent ID to the front of the list', () => {
      const result = rememberRecentAgent('agent-1')
      expect(result).toEqual(['agent-1'])
      expect(JSON.parse(localStorage.getItem(RECENT_AGENTS_STORAGE_KEY))).toEqual(['agent-1'])
    })

    it('moves an existing agent ID to the front without duplicates', () => {
      rememberRecentAgent('agent-1')
      rememberRecentAgent('agent-2')
      rememberRecentAgent('agent-1')

      expect(loadRecentAgentIds()).toEqual(['agent-1', 'agent-2'])
    })

    it('caps the list at MAX_RECENT_AGENTS (5 items)', () => {
      for (let i = 1; i <= 7; i++) {
        rememberRecentAgent(`agent-${i}`)
      }

      const recent = loadRecentAgentIds()
      expect(recent).toHaveLength(MAX_RECENT_AGENTS)
      expect(recent).toEqual(['agent-7', 'agent-6', 'agent-5', 'agent-4', 'agent-3'])
    })

    it('recovers gracefully when existing data in localStorage is malformed', () => {
      localStorage.setItem(RECENT_AGENTS_STORAGE_KEY, '{invalid-json')
      const result = rememberRecentAgent('agent-new')

      expect(result).toEqual(['agent-new'])
      expect(loadRecentAgentIds()).toEqual(['agent-new'])
    })

    it('ignores empty, non-string, or whitespace-only agent IDs', () => {
      rememberRecentAgent('agent-1')
      expect(rememberRecentAgent(null)).toEqual(['agent-1'])
      expect(rememberRecentAgent(undefined)).toEqual(['agent-1'])
      expect(rememberRecentAgent('')).toEqual(['agent-1'])
      expect(rememberRecentAgent('   ')).toEqual(['agent-1'])
      expect(rememberRecentAgent(123)).toEqual(['agent-1'])
      expect(rememberRecentAgent({})).toEqual(['agent-1'])
    })

    it('does not throw when localStorage setItem throws (e.g. quota exceeded)', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      expect(() => {
        rememberRecentAgent('agent-1')
      }).not.toThrow()
    })
  })
})
