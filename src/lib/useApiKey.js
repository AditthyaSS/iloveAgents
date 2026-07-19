import { useState, useEffect, useCallback } from 'react'

const STORAGE_PREFIX = 'ila_apikey_'
const EXPIRY_MS = 8 * 60 * 60 * 1000 // 8 hours

/**
 * Safely retrieve an API key if it exists and hasn't expired.
 * Keys are wrapped with expiry timestamps to prevent indefinite persistence
 * even if storage backend is changed to localStorage.
 */
function getSafeApiKey(provider) {
  const raw = sessionStorage.getItem(STORAGE_PREFIX + provider)
  if (!raw) return null
  try {
    const { key, expiresAt } = JSON.parse(raw)
    if (Date.now() > expiresAt) {
      sessionStorage.removeItem(STORAGE_PREFIX + provider)
      return null
    }
    return key
  } catch {
    // Migrate legacy plaintext keys (no expiry)
    return raw
  }
}

/**
 * Store an API key with an expiry timestamp.
 */
function setSafeApiKey(provider, key) {
  if (key) {
    sessionStorage.setItem(STORAGE_PREFIX + provider, JSON.stringify({
      key,
      expiresAt: Date.now() + EXPIRY_MS,
    }))
  } else {
    sessionStorage.removeItem(STORAGE_PREFIX + provider)
  }
}

/**
 * Custom hook for managing API key state with optional sessionStorage persistence.
 */
export function useApiKey() {
  const [provider, setProvider] = useState('openai')
  const [apiKey, setApiKey] = useState('')
  const [saveForSession, setSaveForSession] = useState(false)

  // Load saved key on mount and provider change
  useEffect(() => {
    const saved = getSafeApiKey(provider)
    if (saved) {
      setApiKey(saved)
      setSaveForSession(true)
    } else {
      setApiKey('')
      setSaveForSession(false)
    }
  }, [provider])

  // Persist or clear from sessionStorage when saveForSession changes
  const updateApiKey = useCallback(
    (key) => {
      setApiKey(key)
      if (saveForSession && key) {
        setSafeApiKey(provider, key)
      }
    },
    [provider, saveForSession]
  )

  const updateSaveForSession = useCallback(
    (save) => {
      setSaveForSession(save)
      if (save && apiKey) {
        setSafeApiKey(provider, apiKey)
      } else {
        setSafeApiKey(provider, null)
      }
    },
    [provider, apiKey]
  )

  return {
    provider,
    setProvider,
    apiKey,
    setApiKey: updateApiKey,
    saveForSession,
    setSaveForSession: updateSaveForSession,
  }
}
