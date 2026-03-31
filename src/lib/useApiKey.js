import { useState, useEffect, useCallback } from 'react'

const STORAGE_PREFIX = 'ila_apikey_'

/**
 * Custom hook for managing API key state with optional sessionStorage persistence.
 */
export function useApiKey() {
  const [provider, setProvider] = useState('openai')
  const [apiKey, setApiKey] = useState('')
  const [saveForSession, setSaveForSession] = useState(false)

  // Load saved key on mount and provider change
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_PREFIX + provider)
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
        sessionStorage.setItem(STORAGE_PREFIX + provider, key)
      }
    },
    [provider, saveForSession]
  )

  const updateSaveForSession = useCallback(
    (save) => {
      setSaveForSession(save)
      if (save && apiKey) {
        sessionStorage.setItem(STORAGE_PREFIX + provider, apiKey)
      } else {
        sessionStorage.removeItem(STORAGE_PREFIX + provider)
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
