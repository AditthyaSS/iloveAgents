import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { buildWorkflowMarkdown } from './exportMarkdown'
import { useFavorites } from './useFavorites'

describe('buildWorkflowMarkdown', () => {
  it('builds filename and content from done steps', () => {
    const { filename, content } = buildWorkflowMarkdown('My Flow', [
      { status: 'done', agentName: 'A', output: 'out-a' },
      { status: 'failed', agentName: 'B', output: 'out-b' },
      { status: 'done', agentName: 'C', output: '' },
    ])
    expect(filename).toBe('my-flow-output.md')
    expect(content).toContain('# My Flow')
    expect(content).toContain('out-a')
    expect(content).not.toContain('out-b')
  })

  it('sanitizes titles', () => {
    const { filename } = buildWorkflowMarkdown('Hello, World!', [])
    expect(filename).toBe('hello-world-output.md')
  })
})

describe('useFavorites', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('toggles and persists ids newest first', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => {
      result.current.toggleFavorite('a')
    })
    expect(result.current.isFavorite('a')).toBe(true)
    act(() => {
      result.current.toggleFavorite('b')
    })
    expect(JSON.parse(localStorage.getItem('ila_favorites'))).toEqual(['b', 'a'])
    act(() => {
      result.current.toggleFavorite('a')
    })
    expect(result.current.isFavorite('a')).toBe(false)
  })

  it('recovers from malformed storage', () => {
    localStorage.setItem('ila_favorites', 'not-json')
    const { result } = renderHook(() => useFavorites())
    expect(result.current.isFavorite('x')).toBe(false)
  })
})
