import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from './Sidebar'

vi.mock('../lib/useCollections', () => ({
  DEFAULT_COLLECTION_ID: 'all-agents',
  useCollections: () => ({ collections: [], moveAgentToCollection: vi.fn() }),
}))
vi.mock('../lib/useAgents', () => ({
  useAgents: () => ({ agents: [], loading: false, error: null }),
}))

function renderSidebar(open, onClose) {
  return render(
    <MemoryRouter>
      <Sidebar open={open} onClose={onClose} />
    </MemoryRouter>
  )
}

describe('Sidebar drawer', () => {
  it('is labelled and closes on Escape while open', () => {
    const onClose = vi.fn()
    renderSidebar(true, onClose)
    expect(screen.getByRole('complementary', { name: /Agents sidebar/i })).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('ignores Escape while closed', () => {
    const onClose = vi.fn()
    renderSidebar(false, onClose)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })
})
