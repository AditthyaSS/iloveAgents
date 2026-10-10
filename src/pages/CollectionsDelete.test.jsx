import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CollectionsPage from './CollectionsPage'

const deleteCollection = vi.fn()

vi.mock('../lib/useAgents', () => ({
  useAgents: () => ({ agents: [], loading: false, error: null }),
}))

vi.mock('../lib/useCollections', () => ({
  DEFAULT_COLLECTION_ID: 'all-agents',
  MAX_COLLECTIONS: 10,
  useCollections: () => ({
    collections: [
      { id: 'all-agents', name: 'All Agents', agentIds: [] },
      { id: 'c1', name: 'Work', agentIds: ['a', 'b'] },
    ],
    createCollection: vi.fn(),
    deleteCollection,
    renameCollection: vi.fn(),
  }),
}))

describe('CollectionsPage delete confirm', () => {
  it('arms on first click and deletes on second', () => {
    render(
      <MemoryRouter>
        <CollectionsPage />
      </MemoryRouter>
    )
    const button = screen.getByRole('button', { name: /^delete$/i })
    fireEvent.click(button)
    expect(deleteCollection).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: /confirm delete \(2 agents\)/i }))
    expect(deleteCollection).toHaveBeenCalledWith('c1')
  })
})
