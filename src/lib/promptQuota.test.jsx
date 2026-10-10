import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePromptHistory } from './usePromptHistory'

function quotaLimit(limit) {
  const original = Storage.prototype.setItem
  const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (k, v) {
    if (String(v).length > limit) {
      const err = new Error('Quota exceeded')
      err.name = 'QuotaExceededError'
      throw err
    }
    return original.call(this, k, v)
  })
  return spy
}

describe('usePromptHistory quota', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('saves and reloads prompts normally', () => {
    const { result } = renderHook(() => usePromptHistory())
    let entry
    act(() => {
      entry = result.current.savePrompt({ text: 'hello world' })
    })
    expect(entry.text).toBe('hello world')
    expect(result.current.prompts[0].text).toBe('hello world')
  })

  it('prunes oldest non favorites instead of losing the new save', () => {
    quotaLimit(900)
    const { result } = renderHook(() => usePromptHistory())
    act(() => {
      result.current.savePrompt({ text: `old-${'x'.repeat(300)}` })
    })
    act(() => {
      result.current.savePrompt({ text: `mid-${'y'.repeat(300)}` })
    })
    let entry
    act(() => {
      entry = result.current.savePrompt({ text: `new-${'z'.repeat(300)}` })
    })
    const texts = result.current.prompts.map((p) => p.text)
    expect(texts).toContain(entry.text)
    expect(texts.some((t) => t.startsWith('old-'))).toBe(false)
  })

  it('keeps favorites while pruning', () => {
    quotaLimit(900)
    const { result } = renderHook(() => usePromptHistory())
    let fav
    act(() => {
      fav = result.current.savePrompt({ text: `fav-${'a'.repeat(280)}` })
    })
    act(() => {
      result.current.toggleFavorite(fav.id)
    })
    act(() => {
      result.current.savePrompt({ text: `drop-${'b'.repeat(280)}` })
    })
    act(() => {
      result.current.savePrompt({ text: `new-${'c'.repeat(280)}` })
    })
    const texts = result.current.prompts.map((p) => p.text)
    expect(texts.some((t) => t.startsWith('fav-'))).toBe(true)
    expect(texts.some((t) => t.startsWith('new-'))).toBe(true)
  })
})
