import { describe, it, expect, beforeEach } from 'vitest'
import { saveGlobalKeys, clearDefaultProvider, getGlobalKeys } from './globalKeys'

beforeEach(() => {
  sessionStorage.clear()
  localStorage.clear()
})

describe('globalKeys validation', () => {
  it('ignores non-string values instead of throwing', () => {
    expect(() => saveGlobalKeys({ openai: null, gemini: 42 })).not.toThrow()
    const keys = getGlobalKeys()
    expect(keys.openai).toBe('')
    expect(keys.gemini).toBe('')
  })

  it('clears the default provider on blank and via helper', () => {
    saveGlobalKeys({ defaultProvider: 'openai' })
    expect(getGlobalKeys().defaultProvider).toBe('openai')
    saveGlobalKeys({ defaultProvider: '' })
    expect(getGlobalKeys().defaultProvider).toBe('')
    saveGlobalKeys({ defaultProvider: 'gemini' })
    clearDefaultProvider()
    expect(getGlobalKeys().defaultProvider).toBe('')
  })
})
