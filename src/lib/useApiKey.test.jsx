import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useApiKey } from './useApiKey'

describe('useApiKey legacy migration', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
  })

  it('rewraps a legacy plaintext value with an expiry on first read', () => {
    sessionStorage.setItem('ila_apikey_openai', 'sk-legacy')
    const { result } = renderHook(() => useApiKey())
    expect(result.current.apiKey).toBe('sk-legacy')
    const stored = JSON.parse(sessionStorage.getItem('ila_apikey_openai'))
    expect(stored.key).toBe('sk-legacy')
    expect(stored.expiresAt).toBeGreaterThan(Date.now())
  })

  it('drops expired wrapped values', () => {
    sessionStorage.setItem(
      'ila_apikey_openai',
      JSON.stringify({ key: 'sk-old', expiresAt: Date.now() - 1000 })
    )
    const { result } = renderHook(() => useApiKey())
    expect(result.current.apiKey).toBe('')
    expect(sessionStorage.getItem('ila_apikey_openai')).toBeNull()
  })
})
