
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

  // Generate recommendations after completing the wizard
  const results = useMemo(() => {
    if (!hasCompleted) return []

    return recommendAgents(agents, preferences)
  }, [agents, preferences, hasCompleted])

  const openWizard = () => {
    setIsOpen(true)
  }

  const closeWizard = () => {
    setIsOpen(false)
  }

  // Update preferences and synchronize categories with the selected goal
  const setPreference = (key, value) => {
    setPreferences((prev) => {
      const updatedPreferences = {
        ...prev,
        [key]: value,
      }

      if (key === 'primaryGoal') {
        const selectedGoal = GOAL_OPTIONS.find(
          (option) => option.id === value
        )

        updatedPreferences.categories = selectedGoal
          ? [...selectedGoal.categories]
          : []
      }

      return updatedPreferences
    })

    setErrors((prev) => ({
      ...prev,
      [key]: undefined,
    }))
  }

  // Add or remove extra preferences
  const toggleExtraPreference = (id) => {
    setPreferences((prev) => ({
      ...prev,
      extraPreferences: prev.extraPreferences.includes(id)
        ? prev.extraPreferences.filter((item) => item !== id)
        : [...prev.extraPreferences, id],
    }))
  }

  // Validate the current step
  const validateStep = (index = currentStepIndex) => {
    let error = null
    let errorKey = null

    if (index === 0 && !preferences.primaryGoal) {
      errorKey = 'primaryGoal'
      error = 'Choose a goal to continue.'
    }

    if (index === 1 && !preferences.experienceLevel) {
      errorKey = 'experienceLevel'
      error = 'Choose how much guidance you want.'
    }

    if (error) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: error,
      }))
      return false
    }

    return true
  }

  // Move to the next step
  const nextStep = () => {
    if (!validateStep()) return false

    setCurrentStepIndex((prev) =>
      Math.min(prev + 1, LAST_STEP_INDEX)
    )

    return true
  }

  // Move to the previous step
  const previousStep = () => {
    if (hasCompleted) {
      setHasCompleted(false)
      return
    }

    setCurrentStepIndex((prev) => Math.max(prev - 1, 0))
  }

  // Complete the wizard
  const completeWizard = () => {
    if (!validateStep()) return false

    setHasCompleted(true)
    return true
  }

  // Reset all wizard data
  const resetWizard = () => {
    setPreferences(createInitialPreferences())
    setErrors({})
    setHasCompleted(false)
    setCurrentStepIndex(0)
  }

  // Allow the user to edit their answers
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
