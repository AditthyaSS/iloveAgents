import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getSafeApiKey, setSafeApiKey } from '../lib/useApiKey'

const ALL_PROVIDERS = ['openai', 'anthropic', 'gemini']

const ApiKeyContext = createContext(null)

export function ApiKeyProvider({ children }) {
  const [keys, setKeys] = useState({ openai: '', anthropic: '', gemini: '' })
  const [provider, setProvider] = useState('openai')
  const [saveForSession, setSaveForSessionState] = useState(false)

  // Hydrate from sessionStorage on mount. Reads go through the shared helpers so
  // expiry handling stays identical to the useApiKey hook still used elsewhere.
  useEffect(() => {
    const saved = {}
    ALL_PROVIDERS.forEach((p) => {
      const k = getSafeApiKey(p)
      if (k) saved[p] = k
    })
    if (Object.keys(saved).length > 0) {
      setKeys((prev) => ({ ...prev, ...saved }))
      setSaveForSessionState(true)
    }
  }, [])

  // Set key for any specific provider
  const setProviderKey = useCallback(
    (providerName, key) => {
      setKeys((prev) => {
        const next = { ...prev, [providerName]: key }
        if (saveForSession) setSafeApiKey(providerName, key)
        return next
      })
    },
    [saveForSession]
  )

  // Toggle session persistence for all providers at once
  const setSaveForSession = useCallback(
    (save) => {
      setSaveForSessionState(save)
      if (save) {
        setKeys((current) => {
          ALL_PROVIDERS.forEach((p) => {
            if (current[p]) setSafeApiKey(p, current[p])
          })
          return current
        })
      } else {
        ALL_PROVIDERS.forEach((p) => setSafeApiKey(p, null))
      }
    },
    []
  )

  // Convenience: key for the currently selected provider
  const apiKey = keys[provider] || ''
  const setApiKey = useCallback(
    (key) => setProviderKey(provider, key),
    [provider, setProviderKey]
  )

  return (
    <ApiKeyContext.Provider
      value={{
        provider,
        setProvider,
        apiKey,
        setApiKey,
        allKeys: keys,
        setProviderKey,
        saveForSession,
        setSaveForSession,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  )
}

export function useApiKeys() {
  const ctx = useContext(ApiKeyContext)
  if (!ctx) throw new Error('useApiKeys must be used within ApiKeyProvider')
  return ctx
}
