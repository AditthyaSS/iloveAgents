import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePromptHistory } from './usePromptHistory'

beforeEach(() => {
  localStorage.clear()
})

function seed(count, favorite) {
  const now = Date.now()
  const arr = Array.from({ length: count }, (_, i) => ({
    id: `p${i}`,
    text: `prompt ${i}`,
    agentId: null,
    agentName: null,
    favorite,
    createdAt: now - i,
  }))
  localStorage.setItem('ila_prompt_history', JSON.stringify(arr))
}

describe('usePromptHistory cap and search', () => {
  it('never grows past the cap even when full of favorites', () => {
    seed(100, true)
    const { result } = renderHook(() => usePromptHistory())
    act(() => result.current.savePrompt({ text: 'one more', agentId: 'a', agentName: 'A' }))
    expect(result.current.prompts.length).toBeLessThanOrEqual(100)
  })

  it('search skips corrupt entries instead of throwing', () => {
    localStorage.setItem(
      'ila_prompt_history',
      JSON.stringify([
        { id: 'c1', text: 42, agentName: null, favorite: false, createdAt: 1 },
        { id: 'c2', text: 'hello world', agentName: null, favorite: false, createdAt: 2 },
      ])
    )
    const { result } = renderHook(() => usePromptHistory())
    expect(() => result.current.searchPrompts('hello')).not.toThrow()
    expect(result.current.searchPrompts('hello')).toHaveLength(1)
  })
})
