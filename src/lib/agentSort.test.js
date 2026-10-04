import { describe, it, expect } from 'vitest'
import { sortAgents } from './agentSort'

const sample = [
  { id: 'b', name: 'Beta', createdAt: '2025-01-02' },
  { id: 'a', name: 'Alpha', createdAt: '2025-06-01' },
  { id: 'c', name: 'Gamma', createdAt: '2024-12-01' },
]

describe('sortAgents', () => {
  it('keeps registry order for relevance', () => {
    expect(sortAgents(sample, 'relevance').map((a) => a.id)).toEqual(['b', 'a', 'c'])
  })

  it('sorts A to Z and Z to A', () => {
    expect(sortAgents(sample, 'az').map((a) => a.id)).toEqual(['a', 'b', 'c'])
    expect(sortAgents(sample, 'za').map((a) => a.id)).toEqual(['c', 'b', 'a'])
  })

  it('sorts newest first', () => {
    expect(sortAgents(sample, 'newest').map((a) => a.id)).toEqual(['a', 'b', 'c'])
  })

  it('handles empty input', () => {
    expect(sortAgents([], 'az')).toEqual([])
    expect(sortAgents(null, 'az')).toEqual([])
  })
})
