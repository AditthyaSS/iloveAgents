import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ApiKeyContext = createContext(null)

const STORAGE_KEYS_KEY = 'ila_apikeys'
const STORAGE_PROVIDER_KEY = 'ila_active_provider'
const STORAGE_SAVE_KEY = 'ila_save_session'

export function ApiKeyProvider({ children }) {
  const [apiKeys, setApiKeys] = useState({ openai: '', anthropic: '', gemini: '' })
  const [provider, setProvider] = useState('openai')
  const [saveForSession, setSaveForSession] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize from sessionStorage on mount
  useEffect(() => {
    const savedSave = sessionStorage.getItem(STORAGE_SAVE_KEY) === 'true'
    setSaveForSession(savedSave)

    if (savedSave) {
      const savedKeysStr = sessionStorage.getItem(STORAGE_KEYS_KEY)
      if (savedKeysStr) {
        try {
          const parsed = JSON.parse(savedKeysStr)
          if (Object.keys(parsed).length > 0) {
            setApiKeys((prev) => ({ ...prev, ...parsed }))
          }
        } catch (e) {
          // ignore parse error
        }
      }
      const savedProvider = sessionStorage.getItem(STORAGE_PROVIDER_KEY)
      if (savedProvider) {
        setProvider(savedProvider)
      }
    }
    setIsInitialized(true)
  }, [])

  // Sync to sessionStorage when things change (only after initialized)
  useEffect(() => {
    if (!isInitialized) return

    if (saveForSession) {
      sessionStorage.setItem(STORAGE_SAVE_KEY, 'true')
      sessionStorage.setItem(STORAGE_KEYS_KEY, JSON.stringify(apiKeys))
      sessionStorage.setItem(STORAGE_PROVIDER_KEY, provider)
    } else {
      sessionStorage.removeItem(STORAGE_SAVE_KEY)
      sessionStorage.removeItem(STORAGE_KEYS_KEY)
      sessionStorage.removeItem(STORAGE_PROVIDER_KEY)
    }
  }, [apiKeys, provider, saveForSession, isInitialized])

  // Helper to set a specific provider's key
  const setApiKeyForProvider = useCallback((prov, key) => {
    setApiKeys((prev) => ({ ...prev, [prov]: key }))
  }, [])

  // Explicitly clear all keys
  const clearKeys = useCallback(() => {
    setApiKeys({ openai: '', anthropic: '', gemini: '' })
  }, [])

  // Compatibility bindings for single-key components
  const apiKey = apiKeys[provider] || ''
  const setApiKey = useCallback((key) => {
    setApiKeyForProvider(provider, key)
  }, [provider, setApiKeyForProvider])

  const value = {
    apiKeys,
    setApiKeys,
    provider,
    setProvider,
    apiKey,
    setApiKey,
    saveForSession,
    setSaveForSession,
    setApiKeyForProvider,
    clearKeys
  }

  return <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>
}

export function useApiKey() {
  const context = useContext(ApiKeyContext)
  if (!context) {
    throw new Error('useApiKey must be used within an ApiKeyProvider')
  }
  return context
}
