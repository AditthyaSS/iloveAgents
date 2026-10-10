import { useState, useCallback, useEffect } from 'react'
import { estimateInputCost, estimateOutputCost, getPricing } from './modelPricing'

const STORAGE_KEY = 'ila_session_spend'
const MAX_RUNS = 200

function sanitizeRun(run) {
  if (!run || typeof run !== 'object') return null
  const totalCost = Number(run.totalCost)
  return {
    ...run,
    inputTokens: Number.isFinite(Number(run.inputTokens)) ? Number(run.inputTokens) : 0,
    outputTokens: Number.isFinite(Number(run.outputTokens)) ? Number(run.outputTokens) : 0,
    inputCost: Number.isFinite(Number(run.inputCost)) ? Number(run.inputCost) : 0,
    outputCost: Number.isFinite(Number(run.outputCost)) ? Number(run.outputCost) : 0,
    totalCost: Number.isFinite(totalCost) ? totalCost : 0,
  }
}

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      if (data && typeof data === 'object' && Array.isArray(data.runs)) {
        const runs = data.runs.map(sanitizeRun).filter(Boolean)
        return { runs, totalSpend: runs.reduce((sum, r) => sum + r.totalCost, 0) }
      }
    }
  } catch {}
  return { runs: [], totalSpend: 0 }
}

function saveSession(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export function useSessionSpend() {
  const [sessionData, setSessionData] = useState(() => loadSession())

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        setSessionData(loadSession())
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const addRun = useCallback(({ model, inputTokens, outputTokens, inputCost, outputCost }) => {
    let inputC = inputCost
    let outputC = outputCost

    if (inputC == null && inputTokens != null && model) {
      inputC = estimateInputCost(model, inputTokens) || 0
    }
    if (outputC == null && outputTokens != null && model) {
      outputC = estimateOutputCost(model, outputTokens) || 0
    }

    const runCost = (inputC || 0) + (outputC || 0)
    const run = {
      model,
      inputTokens: inputTokens || 0,
      outputTokens: outputTokens || 0,
      inputCost: inputC || 0,
      outputCost: outputC || 0,
      totalCost: runCost,
      timestamp: Date.now(),
    }

    // Merge against the current on-disk value, not stale in-memory state,
    // so a concurrent write (another tab, or two runs completing close
    // together) isn't silently discarded by the last write winning.
    const prev = loadSession()
    const runs = [run, ...prev.runs].slice(0, MAX_RUNS)
    const totalSpend = runs.reduce((sum, r) => sum + r.totalCost, 0)
    const newData = { runs, totalSpend }
    saveSession(newData)
    setSessionData(newData)
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setSessionData({ runs: [], totalSpend: 0 })
  }, [])

  return {
    runs: sessionData.runs,
    totalSpend: sessionData.totalSpend,
    addRun,
    clearSession,
  }
}
