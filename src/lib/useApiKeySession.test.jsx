import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useApiKey } from './useApiKey'
import { saveGlobalKeys } from './globalKeys'

const wrap = (key) => JSON.stringify({ key, expiresAt: Date.now() + 60_000 })

describe('useApiKey session hygiene', () => {
  it('purges stale session keys when persistence is off', () => {
    sessionStorage.clear()
    localStorage.clear()
    const { result } = renderHook(() => useApiKey())
    expect(result.current.apiKey).toBe('')
    act(() => {
      sessionStorage.setItem('ila_apikey_openai', wrap('stale-key'))
      result.current.setApiKey('typed-key')
    })
    expect(sessionStorage.getItem('ila_apikey_openai')).toBeNull()
    expect(result.current.apiKey).toBe('typed-key')
  })

  it('picks up global key changes without a provider switch', () => {
    sessionStorage.clear()
    localStorage.clear()
    const { result } = renderHook(() => useApiKey())
    expect(result.current.apiKey).toBe('')
    act(() => {
      saveGlobalKeys({ openai: 'global-k' })
      window.dispatchEvent(new StorageEvent('storage', { key: 'iloveagents_openai_key' }))
    })
    expect(result.current.apiKey).toBe('global-k')
  })
})
