import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from './Sidebar'

vi.mock('../lib/useCollections', () => ({
  DEFAULT_COLLECTION_ID: 'all',
  useCollections: () => ({
    collections: [{ id: 'c1', name: 'Reads', agentIds: [] }],
    moveAgentToCollection: () => ({ ok: true }),
  }),
}))
vi.mock('../lib/useAgents', () => {
  const agents = []
  return { useAgents: () => ({ agents }) }
})

function dropOnCollection() {
  const target = screen.getByText('Reads').closest('a')
  fireEvent.drop(target, {
    dataTransfer: { getData: () => 'a1' },
  })
}

describe('Sidebar drag feedback', () => {
  it('announces drop results in a live region', () => {
    render(
      <MemoryRouter>
        <Sidebar open onClose={vi.fn()} />
      </MemoryRouter>
    )
    dropOnCollection()
    expect(screen.getByRole('status')).toHaveTextContent(/moved to reads/i)
  })
})
