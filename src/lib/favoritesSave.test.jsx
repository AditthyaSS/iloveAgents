import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFavorites } from './useFavorites'

describe('useFavorites storage failure', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('toggles stars without throwing when writes fail', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      const err = new Error('Access denied')
      err.name = 'SecurityError'
      throw err
    })
    const { result } = renderHook(() => useFavorites())
    expect(() => {
      act(() => {
        result.current.toggleFavorite('a1')
      })
    }).not.toThrow()
    expect(result.current.isFavorite('a1')).toBe(true)
  })
})
