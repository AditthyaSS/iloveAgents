import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { filterAgents, buildAgentSearchIndex, useAgentFiltering } from './useAgentFiltering'

const agents = [
  { id: 'a1', name: 'Alpha Writer', description: 'writes', category: 'Writing', provider: 'openai', model: 'gpt-4o' },
  { id: 'b2', name: 'Beta Coder', description: 'codes', category: 'Engineering', provider: 'any', model: 'gpt-4o-mini' },
  null,
]

describe('filterAgents', () => {
  it('returns everything without filters and skips null entries', () => {
    expect(filterAgents(agents, {})).toHaveLength(2)
  })

  it('combines category, provider, collection, and text', () => {
    expect(filterAgents(agents, { category: 'Engineering' }).map((a) => a.id)).toEqual(['b2'])
    expect(filterAgents(agents, { provider: 'openai' }).map((a) => a.id)).toEqual(['a1'])
    expect(filterAgents(agents, { query: 'ALPHA' }).map((a) => a.id)).toEqual(['a1'])
    expect(
      filterAgents(agents, {
        collectionId: 'c1',
        defaultCollectionId: 'all',
        getCollectionId: (id) => (id === 'b2' ? 'c1' : 'other'),
      }).map((a) => a.id)
    ).toEqual(['b2'])
  })

  it('matches model and provider labels through the index', () => {
    const index = buildAgentSearchIndex(agents)
    expect(filterAgents(agents, { query: 'gpt-4o-mini', searchIndex: index }).map((a) => a.id)).toEqual([
      'b2',
    ])
  })
})

describe('useAgentFiltering', () => {
  it('filters on query change', () => {
    const { result, rerender } = renderHook(
      ({ query }) => useAgentFiltering(agents, { query }),
      { initialProps: { query: '' } }
    )
    expect(result.current).toHaveLength(2)
    rerender({ query: 'beta' })
    expect(result.current.map((a) => a.id)).toEqual(['b2'])
  })
})
