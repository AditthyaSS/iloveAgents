import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFavorites } from './useFavorites'

const KEY = 'ila_favorites'
const stored = () => localStorage.getItem(KEY)

// Browsers raise QuotaExceededError when the origin is over quota and
// SecurityError when storage is blocked, for example in Safari private mode.
function rejectWrites() {
  return vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
  })
}

beforeEach(() => {
  localStorage.clear()
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useFavorites', () => {
  it('starts with an empty list when nothing was saved', () => {
    const { result } = renderHook(() => useFavorites())
    expect(result.current.favorites).toEqual([])
    expect(result.current.isFavorite('code-reviewer')).toBe(false)
  })

  it('persists a favorite and keeps the newest entry first', () => {
    const { result } = renderHook(() => useFavorites())

    let outcome
    act(() => { outcome = result.current.toggleFavorite('code-reviewer') })
    act(() => { result.current.toggleFavorite('regex-generator') })

    expect(outcome).toBe(true)
    expect(result.current.favorites).toEqual(['regex-generator', 'code-reviewer'])
    expect(JSON.parse(stored())).toEqual(['regex-generator', 'code-reviewer'])
    expect(result.current.isFavorite('regex-generator')).toBe(true)
  })

  it('removes a favorite when the same id is toggled again', () => {
    const { result } = renderHook(() => useFavorites())

    act(() => { result.current.toggleFavorite('code-reviewer') })

    let outcome
    act(() => { outcome = result.current.toggleFavorite('code-reviewer') })

    expect(outcome).toBe(true)
    expect(result.current.favorites).toEqual([])
    expect(JSON.parse(stored())).toEqual([])
  })

  it('does not throw out of the caller when the write is rejected', () => {
    const { result } = renderHook(() => useFavorites())
    rejectWrites()

    let outcome
    expect(() => {
      act(() => { outcome = result.current.toggleFavorite('code-reviewer') })
    }).not.toThrow()

    // The toggle reported failure, nothing reached storage, and the hook did
    // not pretend the agent was starred.
    expect(outcome).toBe(false)
    expect(stored()).toBeNull()
    expect(result.current.favorites).toEqual([])
    expect(result.current.isFavorite('code-reviewer')).toBe(false)
  })

  it('leaves the previously saved list untouched when the write is rejected', () => {
    localStorage.setItem(KEY, JSON.stringify(['code-reviewer']))
    const { result } = renderHook(() => useFavorites())

    rejectWrites()
    act(() => { result.current.toggleFavorite('regex-generator') })

    vi.restoreAllMocks()
    expect(JSON.parse(stored())).toEqual(['code-reviewer'])
    expect(result.current.favorites).toEqual(['code-reviewer'])
  })

  it('keeps every consumer aligned with storage after a failed write', () => {
    const first = renderHook(() => useFavorites())
    const second = renderHook(() => useFavorites())

    act(() => { first.result.current.toggleFavorite('code-reviewer') })
    expect(second.result.current.favorites).toEqual(['code-reviewer'])

    rejectWrites()
    act(() => { first.result.current.toggleFavorite('regex-generator') })

    // Neither component may show a favorite that is not on disk.
    expect(first.result.current.favorites).toEqual(['code-reviewer'])
    expect(second.result.current.favorites).toEqual(['code-reviewer'])
  })

  it('falls back to an empty list when the stored value is malformed', () => {
    localStorage.setItem(KEY, '{not json')

    const { result } = renderHook(() => useFavorites())

    expect(result.current.favorites).toEqual([])
    expect(result.current.isFavorite('code-reviewer')).toBe(false)
  })

  it('ignores stored entries that cannot be an agent id', () => {
    localStorage.setItem(KEY, JSON.stringify(['code-reviewer', 3, null, '', {}]))

    const { result } = renderHook(() => useFavorites())

    expect(result.current.favorites).toEqual(['code-reviewer'])
  })
})
