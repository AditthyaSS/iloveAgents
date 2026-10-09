import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRecommendationWizard } from './useRecommendationWizard'

describe('useRecommendationWizard preferences', () => {
  it('keeps manual categories across goal changes', () => {
    const { result } = renderHook(() => useRecommendationWizard([]))
    act(() => {
      result.current.setPreference('primaryGoal', 'write')
    })
    const adopted = result.current.preferences.categories
    act(() => {
      result.current.setPreference('categories', ['Custom'])
    })
    act(() => {
      result.current.setPreference('primaryGoal', 'code')
    })
    expect(result.current.preferences.categories).toEqual(['Custom'])
    expect(adopted).not.toBe(result.current.preferences.categories)
  })
})
