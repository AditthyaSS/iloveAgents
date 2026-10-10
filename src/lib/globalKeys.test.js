import { describe, it, expect, beforeEach } from 'vitest'
import {
  getGlobalKeys,
  saveGlobalKeys,
  clearGlobalKey,
  clearAllGlobalKeys,
  getAvailableProviders,
} from './globalKeys'

describe('globalKeys', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('saves and reads keys back', () => {
    saveGlobalKeys({ openai: 'sk-live' })
    expect(getGlobalKeys().openai).toBe('sk-live')
  })

  it('expires old entries', () => {
    sessionStorage.setItem(
      'iloveagents_openai_key',
      JSON.stringify({ key: 'sk-old', expiresAt: Date.now() - 1000 })
    )
    expect(getGlobalKeys().openai).toBe('')
    expect(sessionStorage.getItem('iloveagents_openai_key')).toBeNull()
  })

  it('migrates legacy localStorage keys into session', () => {
    localStorage.setItem('iloveagents_openai_key', 'sk-legacy')
    expect(getGlobalKeys().openai).toBe('sk-legacy')
    expect(localStorage.getItem('iloveagents_openai_key')).toBeNull()
    expect(JSON.parse(sessionStorage.getItem('iloveagents_openai_key')).key).toBe('sk-legacy')
  })

  it('never overwrites saved keys with blanks', () => {
    saveGlobalKeys({ openai: 'sk-live' })
    saveGlobalKeys({ openai: '' })
    expect(getGlobalKeys().openai).toBe('sk-live')
  })

  it('clears single and all keys', () => {
    saveGlobalKeys({ openai: 'a', gemini: 'b' })
    clearGlobalKey('openai')
    expect(getGlobalKeys().openai).toBe('')
    expect(getGlobalKeys().gemini).toBe('b')
    clearAllGlobalKeys()
    expect(getGlobalKeys().gemini).toBe('')
  })

  it('lists only providers with saved keys', () => {
    saveGlobalKeys({ anthropic: 'sk-ant' })
    const ids = getAvailableProviders().map((p) => p.id)
    expect(ids).toContain('anthropic')
    expect(ids).not.toContain('openai')
  })
})
