import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCollections, DEFAULT_COLLECTION_ID } from './useCollections'

describe('collection add vs move', () => {
  it('additive adds keep the agent everywhere else', () => {
    localStorage.clear()
    const { result } = renderHook(() => useCollections())
    let first
    act(() => {
      first = result.current.createCollection('First')
    })
    expect(first.ok).toBe(true)
    let second
    act(() => {
      second = result.current.createCollection('Second')
    })
    const c1 = second.collections.find((c) => c.name === 'First').id
    const c2 = second.collections.find((c) => c.name === 'Second').id
    act(() => {
      expect(result.current.addAgentToCollection(c1, 'a1').ok).toBe(true)
    })
    act(() => {
      expect(result.current.addAgentToCollection(c2, 'a1').ok).toBe(true)
    })
    const inFirst = result.current.getCollectionById(c1).agentIds
    expect(inFirst).toContain('a1')
    expect(inFirst.length).toBeGreaterThan(0)
    expect(DEFAULT_COLLECTION_ID).toBeTruthy()
  })

  it('move relocates exclusively', () => {
    localStorage.clear()
    const { result } = renderHook(() => useCollections())
    let created
    act(() => {
      created = result.current.createCollection('M1')
    })
    const c1 = created.collections.find((c) => c.name === 'M1').id
    let created2
    act(() => {
      created2 = result.current.createCollection('M2')
    })
    const c2 = created2.collections.find((c) => c.name === 'M2').id
    act(() => {
      result.current.addAgentToCollection(c1, 'a9')
    })
    act(() => {
      expect(result.current.moveAgentToCollection('a9', c2).ok).toBe(true)
    })
    expect(result.current.getCollectionById(c1).agentIds).not.toContain('a9')
    expect(result.current.getCollectionById(c2).agentIds).toContain('a9')
  })
})
