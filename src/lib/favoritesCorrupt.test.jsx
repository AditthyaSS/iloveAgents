import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFavorites } from './useFavorites'

beforeEach(() => {
  localStorage.clear()
})

describe('useFavorites corrupt storage', () => {
  it('recovers when stored value is not an array', () => {
    localStorage.setItem('ila_favorites', JSON.stringify({ not: 'an array' }))
    const { result } = renderHook(() => useFavorites())
    expect(result.current.favorites).toEqual([])
    act(() => result.current.toggleFavorite('a1'))
    expect(result.current.favorites).toEqual(['a1'])
  })

  it('starts empty when storage reads throw and when stored scalars exist', () => {
    localStorage.setItem('ila_favorites', '42')
    const { result, unmount } = renderHook(() => useFavorites())
    expect(result.current.favorites).toEqual([])
    act(() => result.current.toggleFavorite('a9'))
    expect(result.current.favorites).toEqual(['a9'])
    unmount()
  })
})
