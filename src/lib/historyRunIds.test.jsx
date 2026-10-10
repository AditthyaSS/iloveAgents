import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHistory } from './useHistory'

describe('useHistory run identity', () => {
  it('issues unique ids and validates input', () => {
    localStorage.clear()
    const { result } = renderHook(() => useHistory())
    let first
    let second
    act(() => {
      first = result.current.saveRun({ agentId: 'a', agentName: 'A', inputs: {}, output: 'x', provider: 'openai' })
      second = result.current.saveRun({ agentId: 'a', agentName: 'A', inputs: {}, output: 'y', provider: 'openai' })
    })
    expect(first.id).not.toBe(second.id)
    act(() => {
      result.current.deleteRun(first.id)
    })
    const remaining = JSON.parse(localStorage.getItem('iloveAgents_history'))
    expect(remaining).toHaveLength(1)
    expect(remaining[0].id).toBe(second.id)
    let bad
    act(() => {
      bad = result.current.saveRun(null)
    })
    expect(bad).toBeNull()
  })
})
