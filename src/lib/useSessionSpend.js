
import { useState, useCallback, useEffect } from 'react'
import {
  estimateInputCost,
  estimateOutputCost,
} from './modelPricing'

const STORAGE_KEY = 'ila_session_spend'
const MAX_RUNS = 200

const EMPTY_SESSION = { runs: [], totalSpend: 0 }

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_SESSION

    const data = JSON.parse(raw)

    if (!data || typeof data !== 'object' || !Array.isArray(data.runs)) {
      return EMPTY_SESSION
    }

    return data
  } catch {
    return EMPTY_SESSION
  }
}

function saveSession(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (error) {
    console.error('Failed to save session:', error)
    return false
  }
}

export function useSessionSpend() {
  const [sessionData, setSessionData] = useState(loadSession)

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        setSessionData(loadSession())
      }
    }

    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const addRun = useCallback(
    ({ model, inputTokens, outputTokens, inputCost, outputCost } = {}) => {
      const inputC =
        inputCost ??
        (inputTokens != null && model
          ? estimateInputCost(model, inputTokens) || 0
          : 0)

      const outputC =
        outputCost ??
        (outputTokens != null && model
          ? estimateOutputCost(model, outputTokens) || 0
          : 0)

      const safeInputCost = Number.isFinite(inputC) && inputC >= 0
        ? inputC
        : 0

      const safeOutputCost = Number.isFinite(outputC) && outputC >= 0
        ? outputC
        : 0

      const run = {
        model,
        inputTokens: inputTokens || 0,
        outputTokens: outputTokens || 0,
        inputCost: safeInputCost,
        outputCost: safeOutputCost,
        totalCost: safeInputCost + safeOutputCost,
        timestamp: Date.now(),
      }

      // Read the latest on-disk data instead of stale React state.
      const previous = loadSession()
      const runs = [run, ...previous.runs].slice(0, MAX_RUNS)

      const totalSpend = runs.reduce(
        (sum, item) => sum + (
          Number.isFinite(item.totalCost) && item.totalCost >= 0
            ? item.totalCost
            : 0
        ),
        0
      )

      const newData = { runs, totalSpend }

      saveSession(newData)
      setSessionData(newData)
    },
    []
  )

  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear session:', error)
    }

    setSessionData(EMPTY_SESSION)
  }, [])

  return {
    runs: sessionData.runs,
    totalSpend: sessionData.totalSpend,
    addRun,
    clearSession,
  }
}
