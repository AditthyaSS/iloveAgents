import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import CollectionDetailPage from './CollectionDetailPage'

vi.mock('../lib/useCollections', () => ({
  DEFAULT_COLLECTION_ID: 'all',
  MAX_AGENTS_PER_COLLECTION: 15,
  useCollections: () => ({
    collections: [{ id: 'c1', name: 'Reads', agentIds: ['a1'] }],
    getCollectionById: (id) => (id === 'c1' ? { id: 'c1', name: 'Reads', agentIds: ['a1'] } : null),
    addAgentToCollection: vi.fn(),
    removeAgentFromCollection: vi.fn(() => ({ ok: true })),
    renameCollection: vi.fn(),
    deleteCollection: vi.fn(),
    getAgentCollectionId: () => 'c1',
    isAgentInCollection: () => true,
  }),
}))
vi.mock('../lib/useAgents', () => {
  const agents = [{ id: 'a1', name: 'Agent One', description: 'd', category: 'Test', provider: 'openai', icon: 'Bot', inputs: [] }]
  return { useAgents: () => ({ agents, loading: false, error: null }) }
})
vi.mock('../lib/useFavorites', () => ({
  useFavorites: () => ({ favorites: [], isFavorite: () => false, toggleFavorite: vi.fn() }),
}))

describe('CollectionDetailPage remove', () => {
  it('names the remove control per agent', () => {
    render(
      <MemoryRouter initialEntries={['/collections/c1']}>
        <Routes>
          <Route path="/collections/:id" element={<CollectionDetailPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(
      screen.getByRole('button', { name: /remove agent one from collection/i })
    ).toBeInTheDocument()
  })
})
