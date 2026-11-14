import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getSafeApiKey, getApiKeyForProvider } from './useApiKey'
import { saveGlobalKeys, clearAllGlobalKeys } from './globalKeys'

describe('getSafeApiKey & getApiKeyForProvider', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
  })

  afterEach(() => {
    sessionStorage.clear()
    localStorage.clear()
  })

  it('correctly extracts string key instead of raw JSON when stored via useApiKey', () => {
    const rawObject = JSON.stringify({
      key: 'sk-ant-test-key-123',
      expiresAt: Date.now() + 60 * 60 * 1000,
    })
    sessionStorage.setItem('ila_apikey_anthropic', rawObject)

    const key = getSafeApiKey('anthropic')
    expect(key).toBe('sk-ant-test-key-123')
    expect(key).not.toContain('{')
    expect(key).not.toContain('expiresAt')

    const effectiveKey = getApiKeyForProvider('anthropic')
    expect(effectiveKey).toBe('sk-ant-test-key-123')
  })

  it('removes and ignores expired session keys', () => {
    const expiredObject = JSON.stringify({
      key: 'sk-ant-expired',
      expiresAt: Date.now() - 1000,
    })
    sessionStorage.setItem('ila_apikey_anthropic', expiredObject)

    const key = getSafeApiKey('anthropic')
    expect(key).toBeNull()
    expect(sessionStorage.getItem('ila_apikey_anthropic')).toBeNull()

    const effectiveKey = getApiKeyForProvider('anthropic')
    expect(effectiveKey).toBe('')
  })

  it('falls back to global keys configured in Settings when no session key exists', () => {
    saveGlobalKeys({
      anthropic: 'sk-ant-from-settings',
    })

    expect(sessionStorage.getItem('ila_apikey_anthropic')).toBeNull()

    const effectiveKey = getApiKeyForProvider('anthropic')
    expect(effectiveKey).toBe('sk-ant-from-settings')
  })

  it('prioritizes active session key over global Settings key', () => {
    saveGlobalKeys({
      anthropic: 'sk-ant-global-key',
    })
    sessionStorage.setItem(
      'ila_apikey_anthropic',
      JSON.stringify({
        key: 'sk-ant-session-override',
        expiresAt: Date.now() + 60 * 60 * 1000,
      })
    )

    const effectiveKey = getApiKeyForProvider('anthropic')
    expect(effectiveKey).toBe('sk-ant-session-override')
  })

  it('falls back to global key when session key has expired', () => {
    saveGlobalKeys({
      gemini: 'gemini-global-valid',
    })
    sessionStorage.setItem(
      'ila_apikey_gemini',
      JSON.stringify({
        key: 'gemini-session-expired',
        expiresAt: Date.now() - 5000,
      })
    )

    const effectiveKey = getApiKeyForProvider('gemini')
    expect(effectiveKey).toBe('gemini-global-valid')
  })

  it('returns empty string when key is not configured in session or global storage', () => {
    const effectiveKey = getApiKeyForProvider('openrouter')
    expect(effectiveKey).toBe('')
  })

  it('tolerates legacy plaintext session keys without expiry wrapper', () => {
    sessionStorage.setItem('ila_apikey_openai', 'sk-legacy-plaintext')
    expect(getApiKeyForProvider('openai')).toBe('sk-legacy-plaintext')
  })
})
