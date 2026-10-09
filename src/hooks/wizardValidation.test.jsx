import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRecommendationWizard } from './useRecommendationWizard'

describe('useRecommendationWizard validation', () => {
  it('validates every step on completion, not just the current one', () => {
    const { result } = renderHook(() => useRecommendationWizard([]))
    let done
    act(() => {
      done = result.current.completeWizard()
    })
    expect(done).toBe(false)
    expect(result.current.hasCompleted).toBe(false)
  })

  it('resets to pristine preferences', () => {
    const { result } = renderHook(() => useRecommendationWizard([]))
    act(() => {
      result.current.setPreference('primaryGoal', 'x')
      result.current.resetWizard()
    })
    expect(result.current.preferences).toEqual({
      primaryGoal: '',
      categories: [],
      experienceLevel: '',
      providerPreference: 'any',
      budgetPreference: 'balanced',
      extraPreferences: [],
      freeTextGoal: '',
    })
    expect(result.current.preferences.categories).not.toBe(result.current.preferences.extraPreferences)
  })
})
