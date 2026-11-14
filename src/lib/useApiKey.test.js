import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getSafeApiKey, getEffectiveApiKey } from './useApiKey'

describe('getSafeApiKey', () => {
  let sessionStore = {}

  beforeEach(() => {
    sessionStore = {}
    global.sessionStorage = {
      getItem: vi.fn((k) => sessionStore[k] ?? null),
      setItem: vi.fn((k, v) => {
        sessionStore[k] = String(v)
      }),
      removeItem: vi.fn((k) => {
        delete sessionStore[k]
      }),
      clear: vi.fn(() => {
        sessionStore = {}
      }),
    }
  })

  it('returns null when no key exists for provider', () => {
    expect(getSafeApiKey('openai')).toBeNull()
    expect(getSafeApiKey(null)).toBeNull()
    expect(getSafeApiKey('')).toBeNull()
  })

  it('extracts valid key when stored with future expiry', () => {
    const futureTime = Date.now() + 1000 * 60 * 60
    sessionStore['ila_apikey_openai'] = JSON.stringify({
      key: 'sk-test-openai-key',
      expiresAt: futureTime,
    })

    const result = getSafeApiKey('openai')
    expect(result).toBe('sk-test-openai-key')
  })

  it('returns null and purges storage when key has expired', () => {
    const pastTime = Date.now() - 1000
    sessionStore['ila_apikey_anthropic'] = JSON.stringify({
      key: 'sk-ant-expired-key',
      expiresAt: pastTime,
    })

    const result = getSafeApiKey('anthropic')
    expect(result).toBeNull()
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('ila_apikey_anthropic')
    expect(sessionStore['ila_apikey_anthropic']).toBeUndefined()
  })

  it('migrates and returns legacy plaintext key without expiry metadata', () => {
    sessionStore['ila_apikey_gemini'] = 'AIzaSyLegacyKey'

    const result = getSafeApiKey('gemini')
    expect(result).toBe('AIzaSyLegacyKey')
  })
})

describe('getEffectiveApiKey', () => {
  let sessionStore = {}
  let localStore = {}

  beforeEach(() => {
    sessionStore = {}
    localStore = {}

    global.sessionStorage = {
      getItem: vi.fn((k) => sessionStore[k] ?? null),
      setItem: vi.fn((k, v) => {
        sessionStore[k] = String(v)
      }),
      removeItem: vi.fn((k) => {
        delete sessionStore[k]
      }),
      clear: vi.fn(() => {
        sessionStore = {}
      }),
    }

    global.localStorage = {
      getItem: vi.fn((k) => localStore[k] ?? null),
      setItem: vi.fn((k, v) => {
        localStore[k] = String(v)
      }),
      removeItem: vi.fn((k) => {
        delete localStore[k]
      }),
      clear: vi.fn(() => {
        localStore = {}
      }),
    }
  })

  it('returns session key first if present and not expired', () => {
    sessionStore['ila_apikey_openai'] = JSON.stringify({
      key: 'sk-session-key',
      expiresAt: Date.now() + 60000,
    })
    sessionStore['iloveagents_openai_key'] = JSON.stringify({
      key: 'sk-global-key',
      expiresAt: Date.now() + 60000,
    })

    const key = getEffectiveApiKey('openai')
    expect(key).toBe('sk-session-key')
  })

  it('falls back to global keys when no session key exists', () => {
    sessionStore['iloveagents_anthropic_key'] = JSON.stringify({
      key: 'sk-ant-global-key',
      expiresAt: Date.now() + 60000,
    })

    const key = getEffectiveApiKey('anthropic')
    expect(key).toBe('sk-ant-global-key')
  })

  it('falls back to global keys when session key is expired', () => {
    sessionStore['ila_apikey_gemini'] = JSON.stringify({
      key: 'AIzaExpiredSession',
      expiresAt: Date.now() - 5000,
    })
    sessionStore['iloveagents_gemini_key'] = JSON.stringify({
      key: 'AIzaValidGlobal',
      expiresAt: Date.now() + 60000,
    })

    const key = getEffectiveApiKey('gemini')
    expect(key).toBe('AIzaValidGlobal')
  })

  it('returns empty string when provider is not configured anywhere', () => {
    expect(getEffectiveApiKey('openrouter')).toBe('')
    expect(getEffectiveApiKey('')).toBe('')
    expect(getEffectiveApiKey(null)).toBe('')
  })
})
