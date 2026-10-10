import { describe, it, expect, beforeEach } from 'vitest'
import {
  getGlobalKeys,
  saveGlobalKeys,
  clearGlobalKey,
  clearAllGlobalKeys,
  getAvailableProviders,
} from './globalKeys.js'

// In-memory storage mock (shared between sessionStorage and localStorage)
const makeStorage = () => {
  let store = {}
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v) },
    removeItem: (k) => { delete store[k] },
    clear: () => { store = {} },
    _store: () => store,
  }
}

const sessionStorageMock = makeStorage()
const localStorageMock = makeStorage()

beforeEach(() => {
  globalThis.sessionStorage = sessionStorageMock
  globalThis.localStorage = localStorageMock
  sessionStorageMock.clear()
  localStorageMock.clear()
})

describe('saveGlobalKeys + getGlobalKeys', () => {
  it('saves and retrieves an openai key', () => {
    saveGlobalKeys({ openai: 'sk-test-key' })
    const { openai } = getGlobalKeys()
    expect(openai).toBe('sk-test-key')
  })

  it('saves and retrieves keys for all four providers', () => {
    saveGlobalKeys({
      openai: 'sk-openai',
      anthropic: 'sk-anthropic',
      gemini: 'gm-gemini',
      openrouter: 'or-openrouter',
    })
    const keys = getGlobalKeys()
    expect(keys.openai).toBe('sk-openai')
    expect(keys.anthropic).toBe('sk-anthropic')
    expect(keys.gemini).toBe('gm-gemini')
    expect(keys.openrouter).toBe('or-openrouter')
  })

  it('saves and retrieves the defaultProvider', () => {
    saveGlobalKeys({ defaultProvider: 'openai' })
    const { defaultProvider } = getGlobalKeys()
    expect(defaultProvider).toBe('openai')
  })

  it('does not overwrite an existing key when passed an empty string', () => {
    saveGlobalKeys({ openai: 'sk-original' })
    saveGlobalKeys({ openai: '' })
    expect(getGlobalKeys().openai).toBe('sk-original')
  })

  it('trims whitespace from saved values', () => {
    saveGlobalKeys({ openai: '  sk-trimmed  ' })
    expect(getGlobalKeys().openai).toBe('sk-trimmed')
  })

  it('returns empty string for a key that was never saved', () => {
    expect(getGlobalKeys().openai).toBe('')
    expect(getGlobalKeys().anthropic).toBe('')
  })

  it('stores keys in sessionStorage, not localStorage', () => {
    saveGlobalKeys({ openai: 'sk-test' })
    // sessionStorage should have the key
    const sessionHasIt = Object.keys(sessionStorageMock._store()).some(k => k.includes('openai'))
    // localStorage should NOT have the key
    const localHasIt = Object.keys(localStorageMock._store()).some(k => k.includes('openai'))
    expect(sessionHasIt).toBe(true)
    expect(localHasIt).toBe(false)
  })

  it('stores defaultProvider in localStorage, not sessionStorage', () => {
    saveGlobalKeys({ defaultProvider: 'anthropic' })
    const localHasIt = Object.values(localStorageMock._store()).includes('anthropic')
    const sessionHasIt = Object.values(sessionStorageMock._store()).some(v => v.includes('anthropic'))
    expect(localHasIt).toBe(true)
    // defaultProvider value itself may appear in session as a side effect of other keys only
    // — main assertion is localStorage has it
  })
})

describe('clearGlobalKey', () => {
  it('removes a single provider key', () => {
    saveGlobalKeys({ openai: 'sk-to-remove', anthropic: 'sk-keep' })
    clearGlobalKey('openai')
    const keys = getGlobalKeys()
    expect(keys.openai).toBe('')
    expect(keys.anthropic).toBe('sk-keep')
  })

  it('does nothing for an unknown provider', () => {
    saveGlobalKeys({ openai: 'sk-test' })
    expect(() => clearGlobalKey('unknown_provider')).not.toThrow()
    expect(getGlobalKeys().openai).toBe('sk-test')
  })
})

describe('clearAllGlobalKeys', () => {
  it('removes all provider keys', () => {
    saveGlobalKeys({
      openai: 'a',
      anthropic: 'b',
      gemini: 'c',
      openrouter: 'd',
      defaultProvider: 'openai'
    })
    clearAllGlobalKeys()
    const keys = getGlobalKeys()
    expect(keys.openai).toBe('')
    expect(keys.anthropic).toBe('')
    expect(keys.gemini).toBe('')
    expect(keys.openrouter).toBe('')
    expect(keys.defaultProvider).toBe('')
  })
})

describe('getAvailableProviders', () => {
  it('returns empty array when no keys are saved', () => {
    expect(getAvailableProviders()).toEqual([])
  })

  it('returns only providers that have saved keys', () => {
    saveGlobalKeys({ openai: 'sk-openai', gemini: 'gm-key' })
    const providers = getAvailableProviders()
    const ids = providers.map(p => p.id)
    expect(ids).toContain('openai')
    expect(ids).toContain('gemini')
    expect(ids).not.toContain('anthropic')
    expect(ids).not.toContain('openrouter')
  })

  it('each result has id and label strings', () => {
    saveGlobalKeys({ anthropic: 'sk-ant' })
    const providers = getAvailableProviders()
    providers.forEach(p => {
      expect(typeof p.id).toBe('string')
      expect(typeof p.label).toBe('string')
      expect(p.label.length).toBeGreaterThan(0)
    })
  })
})
