import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from './HomePage'

vi.mock('../lib/useAgents', () => {
  const agents = []
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

describe('HomePage footer', () => {
  it('uses consistent headings and warns about new tabs', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: 'Resources' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /documentation.*new tab/i })).toHaveAttribute('target', '_blank')
  })
})
