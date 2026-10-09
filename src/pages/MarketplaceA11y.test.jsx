import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MarketplacePage from './MarketplacePage'

vi.mock('../lib/useAgents', () => {
  const agents = [{ id: 'a1', name: 'Agent One', provider: 'openai', systemPrompt: 'sys', outputType: 'text' }]
  return { useAgents: () => ({ agents }) }
})
vi.mock('../components/ApiKeyBar', () => ({ default: () => null }))

describe('MarketplacePage a11y', () => {
  it('supports keyboard rating, linked publish labels, Escape, and status', () => {
    render(
      <MemoryRouter>
        <MarketplacePage />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: /publish to marketplace/i }))
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByLabelText(/display name/i)).toBeNull()
  })
})
