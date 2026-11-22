
import { useMemo, useState } from 'react'
import { recommendAgents } from '../lib/agentRecommendation/scoring.js'
import { GOAL_OPTIONS } from '../lib/agentRecommendation/constants.js'

const createInitialPreferences = () => ({
  primaryGoal: '',
  categories: [],
  experienceLevel: '',
  providerPreference: 'any',
  budgetPreference: 'balanced',
  extraPreferences: [],
  freeTextGoal: '',
})

const LAST_STEP_INDEX = 4

export function useRecommendationWizard(agents = []) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [preferences, setPreferences] = useState(createInitialPreferences)
  const [hasCompleted, setHasCompleted] = useState(false)
  const [errors, setErrors] = useState({})

  // Generate recommendations using the latest preferences.
  const results = useMemo(() => {
    if (!hasCompleted) return []

    return recommendAgents(agents, preferences)
  }, [agents, preferences, hasCompleted])

  const openWizard = () => setIsOpen(true)

  const closeWizard = () => setIsOpen(false)

  // Update preferences and synchronize goal categories.
  const setPreference = (key, value) => {
    setPreferences((prev) => {
      const updated = {
        ...prev,
        [key]: value,
      }

      if (key === 'primaryGoal') {
        const selectedGoal = GOAL_OPTIONS.find(
          (option) => option.id === value
        )

        updated.categories = selectedGoal?.categories || []
      }

      return updated
    })

    setErrors((prev) => ({
      ...prev,
      [key]: undefined,
    }))
  }

  const toggleExtraPreference = (id) => {
    setPreferences((prev) => ({
      ...prev,
      extraPreferences: prev.extraPreferences.includes(id)
        ? prev.extraPreferences.filter((item) => item !== id)
        : [...prev.extraPreferences, id],
    }))
  }

  const validateStep = (index = currentStepIndex) => {
    if (index === 0 && !preferences.primaryGoal) {
      setErrors({
        primaryGoal: 'Choose a goal to continue.',
      })
      return false
    }

    if (index === 1 && !preferences.experienceLevel) {
      setErrors({
        experienceLevel: 'Choose how much guidance you want.',
      })
      return false
    }

    return true
  }

  const nextStep = () => {
    if (!validateStep()) return false

    setCurrentStepIndex((idx) =>
      Math.min(idx + 1, LAST_STEP_INDEX)
    )

    return true
  }

  const previousStep = () => {
    if (hasCompleted) {
      setHasCompleted(false)
      setCurrentStepIndex(LAST_STEP_INDEX)
      return
    }

    setCurrentStepIndex((idx) => Math.max(idx - 1, 0))
  }

  const completeWizard = () => {
    if (!validateStep()) return false

    setHasCompleted(true)
    return true
  }

  const resetWizard = () => {
    setPreferences(createInitialPreferences())
    setErrors({})
    setHasCompleted(false)
    setCurrentStepIndex(0)
  }

  const refineAnswers = () => {
    setHasCompleted(false)
    setCurrentStepIndex(LAST_STEP_INDEX)
  }

  return {
    isOpen,
    currentStepIndex,
    preferences,
    results,
    hasCompleted,
    errors,
    openWizard,
    closeWizard,
    setPreference,
    toggleExtraPreference,
    nextStep,
    previousStep,
    resetWizard,
    completeWizard,
    refineAnswers,
  }
}
