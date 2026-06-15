import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useApiKey, ApiKeyProvider } from './useApiKey'
import React from 'react'

describe('useApiKey', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  const wrapper = ({ children }) => <ApiKeyProvider>{children}</ApiKeyProvider>

  it('provides default values', () => {
    const { result } = renderHook(() => useApiKey(), { wrapper })

    expect(result.current.apiKeys).toEqual({ openai: '', anthropic: '', gemini: '' })
    expect(result.current.provider).toBe('openai')
    expect(result.current.saveForSession).toBe(false)
  })

  it('updates apiKeys correctly', () => {
    const { result } = renderHook(() => useApiKey(), { wrapper })

    act(() => {
      result.current.setApiKeyForProvider('openai', 'sk-test-123')
    })

    expect(result.current.apiKeys.openai).toBe('sk-test-123')
  })

  it('saves to sessionStorage when saveForSession is true', () => {
    const { result } = renderHook(() => useApiKey(), { wrapper })

    act(() => {
      result.current.setSaveForSession(true)
    })

    act(() => {
      result.current.setApiKeyForProvider('openai', 'sk-session')
    })

    const savedKeys = JSON.parse(sessionStorage.getItem('ila_apikeys') || '{}')
    expect(savedKeys.openai).toBe('sk-session')
    expect(sessionStorage.getItem('ila_save_session')).toBe('true')
  })
})
