// ============================================================
// I LOVE AGENTS — Onboarding Tour State Management
// ============================================================
//
// Manages whether the user has completed the onboarding tour,
// whether the tour is currently active, and provides controls
// to start / end / reset the tour.
//
// Persists completion state in localStorage under the key
// `ila_onboarding_complete` (same naming convention as
// `ila_theme` and `iloveagents_banner_dismissed`).
// ============================================================

import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'ila_onboarding_complete'

function hasCompleted() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function useOnboarding() {
  const [isTourActive, setIsTourActive] = useState(() => {
    // Auto-start on first visit, but only on desktop-sized screens
    if (typeof window === 'undefined') return false
    if (window.innerWidth < 768) return false
    return !hasCompleted()
  })
  const [completed, setCompleted] = useState(hasCompleted)

  useEffect(() => {
    const sync = () => setCompleted(hasCompleted())
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const startTour = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // localStorage unavailable — fail silently
    }
    setCompleted(false)
    setIsTourActive(true)
  }, [])

  const endTour = useCallback(() => {
    setIsTourActive(false)
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // localStorage unavailable — fail silently
    }
    setCompleted(true)
  }, [])

  const resetTour = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // fail silently
    }
    setCompleted(false)
    setIsTourActive(true)
  }, [])

  return {
    isTourActive,
    hasCompletedTour: completed,
    startTour,
    endTour,
    resetTour,
  }
}
