import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCollections, MAX_AGENTS_PER_COLLECTION, DEFAULT_COLLECTION_ID } from './useCollections'

describe('collection delete merge', () => {
  it('refuses merges that would overflow the default collection', () => {
    localStorage.clear()
    const { result } = renderHook(() => useCollections())
    let big
    act(() => {
      big = result.current.createCollection('Big')
    })
    const bigId = big.collections.find((c) => c.name === 'Big').id
    act(() => {
      result.current.addAgentToCollection(DEFAULT_COLLECTION_ID, 'seed-agent')
    })
    const ids = Array.from({ length: MAX_AGENTS_PER_COLLECTION }, (_, i) => `agent-${i}`)
    for (const id of ids) {
      act(() => {
        result.current.addAgentToCollection(bigId, id)
      })
    }
    let outcome
    act(() => {
      outcome = result.current.deleteCollection(bigId)
    })
    expect(outcome.ok).toBe(false)
    expect(outcome.error).toMatch(/past .* agents/i)
    expect(result.current.getCollectionById(bigId).agentIds).toHaveLength(
      MAX_AGENTS_PER_COLLECTION
    )
  })

  it('matches padded ids on remove and membership', () => {
    localStorage.clear()
    const { result } = renderHook(() => useCollections())
    let created
    act(() => {
      created = result.current.createCollection('Pad')
    })
    const id = created.collections.find((c) => c.name === 'Pad').id
    act(() => {
      result.current.addAgentToCollection(id, 'a1')
    })
    expect(result.current.isAgentInCollection(id, '  a1  ')).toBe(true)
    act(() => {
      result.current.removeAgentFromCollection(id, '  a1  ')
    })
    expect(result.current.isAgentInCollection(id, 'a1')).toBe(false)
  })
})
