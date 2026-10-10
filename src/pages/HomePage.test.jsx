import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from './HomePage'

vi.mock('../lib/useAgents', () => {
  const agents = [
    { id: 'alpha', name: 'Alpha Writer', description: 'writes things', category: 'Writing', provider: 'openai', model: 'gpt-4o', icon: 'Bot' },
    { id: 'beta', name: 'Beta Coder', description: 'codes things', category: 'Engineering', provider: 'any', icon: 'Bot' },
  ]
  return { useAgents: () => ({ agents, loading: false }) }
})
vi.mock('../lib/useFavorites', () => ({
  useFavorites: () => ({ favorites: [], isFavorite: () => false, toggleFavorite: vi.fn() }),
}))
vi.mock('../lib/useHistory', () => ({
  useHistory: () => ({ history: [], deleteRun: vi.fn(), clearHistory: vi.fn() }),
}))
vi.mock('../lib/useCollections', () => ({
  DEFAULT_COLLECTION_ID: 'all',
  useCollections: () => ({ collections: [], getAgentCollectionId: () => 'all' }),
}))
vi.mock('../components/RecentRuns', () => ({ default: () => null }))
vi.mock('../components/recommendation/RecommendationWizardEntry', () => ({ default: () => null }))
vi.mock('../components/recommendation/RecommendationWizardModal', () => ({ default: () => null }))

// Mocks above are self-contained (no test-scope captures).

describe('HomePage search', () => {
  it('filters the grid as the user types', async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )
    expect(screen.getByText('Alpha Writer')).toBeInTheDocument()
    expect(screen.getByText('Beta Coder')).toBeInTheDocument()
    const box = screen.getByPlaceholderText(/search/i)
    fireEvent.change(box, { target: { value: 'beta' } })
    expect(box.value).toBe('beta')
    await act(async () => {})
    expect(screen.queryByText('Alpha Writer')).toBeNull()
    expect(screen.getByText('Beta Coder')).toBeInTheDocument()
  })
})
