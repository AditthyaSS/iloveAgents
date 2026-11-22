import { describe, expect, it } from 'vitest'
import { sortAgents } from './agentSort'

const agents = [
  { id: 'later', name: 'Zeta', createdAt: '2026-04-15' },
  { id: 'earlier', name: 'alpha', createdAt: '2025-11-02' },
  { id: 'unknown-date', name: 'Beta' },
]

describe('sortAgents', () => {
  it('keeps registry order for the relevance sort', () => {
    expect(sortAgents(agents, 'relevance').map((agent) => agent.id)).toEqual([
      'later',
      'earlier',
      'unknown-date',
    ])
  })

  it('sorts names alphabetically without changing the source array', () => {
    expect(sortAgents(agents, 'name-asc').map((agent) => agent.name)).toEqual([
      'alpha',
      'Beta',
      'Zeta',
    ])
    expect(agents.map((agent) => agent.id)).toEqual([
      'later',
      'earlier',
      'unknown-date',
    ])
  })

  it('sorts names in reverse alphabetical order', () => {
    expect(sortAgents(agents, 'name-desc').map((agent) => agent.name)).toEqual([
      'Zeta',
      'Beta',
      'alpha',
    ])
  })

  it('puts the newest agents first and agents without dates last', () => {
    expect(sortAgents(agents, 'newest').map((agent) => agent.id)).toEqual([
      'later',
      'earlier',
      'unknown-date',
    ])
  })
})
