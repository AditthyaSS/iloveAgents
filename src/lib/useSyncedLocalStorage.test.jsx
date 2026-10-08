import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSyncedLocalStorage } from './useSyncedLocalStorage'
import { useFavorites } from './useFavorites'

beforeEach(() => {
  localStorage.clear()
})

describe('useSyncedLocalStorage', () => {
  it('reads, writes, and validates', () => {
    localStorage.setItem('t_key', JSON.stringify({ not: 'array' }))
    const { result } = renderHook(() => useSyncedLocalStorage('t_key', { initial: [], validate: Array.isArray }))
    expect(result.current[0]).toEqual([])
    act(() => result.current[1](['a']))
    expect(JSON.parse(localStorage.getItem('t_key'))).toEqual(['a'])
  })

  it('syncs across hook instances and storage events', () => {
    const first = renderHook(() => useSyncedLocalStorage('t_sync', { initial: [] }))
    const second = renderHook(() => useSyncedLocalStorage('t_sync', { initial: [] }))
    act(() => first.result.current[1](['x']))
    expect(second.result.current[0]).toEqual(['x'])
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 't_sync' }))
    })
    expect(first.result.current[0]).toEqual(['x'])
  })

  it('caps arrays', () => {
    const { result } = renderHook(() => useSyncedLocalStorage('t_cap', { initial: [], cap: 2 }))
    act(() => result.current[1](['a', 'b', 'c']))
    expect(result.current[0]).toEqual(['a', 'b'])
  })
})

describe('useFavorites on the primitive', () => {
  it('toggles with newest first and survives corrupt storage', () => {
    localStorage.setItem('ila_favorites', JSON.stringify({ nope: 1 }))
    const { result } = renderHook(() => useFavorites())
    expect(result.current.favorites).toEqual([])
    act(() => result.current.toggleFavorite('a1'))
    act(() => result.current.toggleFavorite('a2'))
    expect(result.current.favorites).toEqual(['a2', 'a1'])
    expect(result.current.isFavorite('a1')).toBe(true)
    act(() => result.current.toggleFavorite('a1'))
    expect(result.current.favorites).toEqual(['a2'])
  })
})
