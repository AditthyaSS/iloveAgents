import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFavorites } from './useFavorites'

describe('useFavorites', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('should save a favorite successfully', () => {
    const { result } = renderHook(() => useFavorites())

    act(() => {
      result.current.toggleFavorite('agent-1')
    })

    expect(result.current.favorites).toEqual(['agent-1'])
    expect(localStorage.getItem('ila_favorites')).toBe(
      JSON.stringify(['agent-1']),
    )
  })

  it('should not throw when localStorage write fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage write failed')
    })

    const { result } = renderHook(() => useFavorites())

    expect(() => {
      act(() => {
        result.current.toggleFavorite('agent-1')
      })
    }).not.toThrow()
  })

  it('should not update favorites when localStorage write fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage write failed')
    })

    const { result } = renderHook(() => useFavorites())

    act(() => {
      result.current.toggleFavorite('agent-1')
    })

    expect(result.current.favorites).toEqual([])
    expect(localStorage.getItem('ila_favorites')).toBeNull()
  })
})
