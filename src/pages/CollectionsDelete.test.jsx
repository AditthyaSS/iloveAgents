import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CollectionsPage from './CollectionsPage'

vi.mock('../lib/useCollections', () => ({
  DEFAULT_COLLECTION_ID: 'all',
  MAX_COLLECTIONS: 10,
  useCollections: () => ({
    collections: [
      { id: 'all', name: 'All Agents', agentIds: [] },
      { id: 'c1', name: 'Reads', agentIds: [] },
    ],
    createCollection: vi.fn(),
    deleteCollection: vi.fn(() => ({ ok: true })),
    renameCollection: vi.fn(),
  }),
}))
vi.mock('../lib/useAgents', () => {
  const agents = []
  return { useAgents: () => ({ agents, loading: false, error: null }) }
})

describe('CollectionsPage delete', () => {
  it('confirms with a named action before deleting', () => {
    const { container } = render(
      <MemoryRouter>
        <CollectionsPage />
      </MemoryRouter>
    )
    expect(container.textContent).toMatch(/Reads/)
    fireEvent.click(screen.getByRole('button', { name: /delete reads/i }))
    expect(screen.getByRole('button', { name: /confirm delete reads/i })).toBeInTheDocument()
  })
})
