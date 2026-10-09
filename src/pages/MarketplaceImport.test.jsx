import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MarketplacePage from './MarketplacePage'
import { publishAgent } from '../lib/marketplace'

vi.mock('../lib/useAgents', () => {
  const agents = []
  return { useAgents: () => ({ agents }) }
})
vi.mock('../components/ApiKeyBar', () => ({ default: () => null }))

beforeEach(() => {
  localStorage.clear()
})

describe('MarketplacePage imports', () => {
  it('persists imports, disables re-import, and blocks repeats', async () => {
    publishAgent({ name: 'Imp', description: 'd', tags: [], category: 'Research', config: {} })
    const first = render(
      <MemoryRouter>
        <MarketplacePage />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: /import imp/i }))
    await act(async () => {})
    expect(screen.getByRole('button', { name: /already imported/i })).toBeDisabled()
    first.unmount()
    render(
      <MemoryRouter>
        <MarketplacePage />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: /already imported/i })).toBeDisabled()
  })
})
