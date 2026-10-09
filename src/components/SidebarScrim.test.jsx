import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from './Sidebar'

vi.mock('../lib/useCollections', () => ({
  DEFAULT_COLLECTION_ID: 'all',
  useCollections: () => ({ collections: [], moveAgentToCollection: vi.fn() }),
}))
vi.mock('../lib/useAgents', () => {
  const agents = []
  return { useAgents: () => ({ agents }) }
})

describe('Sidebar scrim', () => {
  it('dismisses by keyboard with a named control', () => {
    const onClose = vi.fn()
    render(
      <MemoryRouter>
        <Sidebar open onClose={onClose} />
      </MemoryRouter>
    )
    const scrim = screen.getByRole('button', { name: /close sidebar/i })
    scrim.focus()
    expect(scrim).toHaveFocus()
    fireEvent.click(scrim)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
