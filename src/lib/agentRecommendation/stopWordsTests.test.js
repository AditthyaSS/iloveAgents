import { describe, it, expect } from 'vitest'
import { tokenizeFreeText } from './scoring.js'
import { STOP_WORDS } from './constants.js'

describe('STOP_WORDS — content and filtering', () => {
  describe('STOP_WORDS set contents', () => {
    it('contains "the"', () => expect(STOP_WORDS.has('the')).toBe(true))
    it('contains "and"', () => expect(STOP_WORDS.has('and')).toBe(true))
    it('contains "for"', () => expect(STOP_WORDS.has('for')).toBe(true))
    it('contains "with"', () => expect(STOP_WORDS.has('with')).toBe(true))
    it('contains "agent"', () => expect(STOP_WORDS.has('agent')).toBe(true))
    it('contains "agents"', () => expect(STOP_WORDS.has('agents')).toBe(true))
    it('is a Set', () => expect(STOP_WORDS instanceof Set).toBe(true))
    it('has at least 10 stop words', () => expect(STOP_WORDS.size).toBeGreaterThanOrEqual(10))
  })

  describe('tokenizeFreeText removes stop words', () => {
    it('removes "the" from tokens', () => {
      const tokens = tokenizeFreeText('the best coding agent for developers')
      expect(tokens).not.toContain('the')
    })

    it('removes "agent" and "agents" from tokens', () => {
      const tokens = tokenizeFreeText('find agent that helps with agents')
      expect(tokens).not.toContain('agent')
      expect(tokens).not.toContain('agents')
    })

    it('removes "for" and "with" from tokens', () => {
      const tokens = tokenizeFreeText('writing tool for blogs with automation')
      expect(tokens).not.toContain('for')
      expect(tokens).not.toContain('with')
    })

    it('removes "help" from tokens', () => {
      const tokens = tokenizeFreeText('help me write better emails')
      expect(tokens).not.toContain('help')
    })

    it('keeps meaningful words after stop word removal', () => {
      const tokens = tokenizeFreeText('the best writing tool for content')
      expect(tokens).toContain('writing')
      expect(tokens).toContain('content')
    })
  })
})
