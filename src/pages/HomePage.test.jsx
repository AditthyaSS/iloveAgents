import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from './HomePage'
import { RECENT_AGENTS_STORAGE_KEY } from '../lib/recentAgents'

vi.mock('../lib/useAgents', () => ({
  useAgents: () => ({
    agents: [
      {
        id: 'code-reviewer',
        name: 'Code Reviewer',
        description: 'Reviews code',
        category: 'Engineering',
        icon: 'Code2',
        provider: 'any',
      },
    ],
    loading: false,
  }),
}))

vi.mock('../lib/useFavorites', () => ({
  useFavorites: () => ({
    favorites: [],
    isFavorite: () => false,
    toggleFavorite: vi.fn(),
  }),
}))

vi.mock('../lib/useHistory', () => ({
  useHistory: () => ({
    history: [],
    deleteRun: vi.fn(),
    clearHistory: vi.fn(),
  }),
}))

vi.mock('../lib/useCollections', () => ({
  DEFAULT_COLLECTION_ID: 'all',
  useCollections: () => ({
    collections: [],
    getAgentCollectionId: () => null,
  }),
}))

vi.mock('../lib/globalKeys', () => ({
  getGlobalKeys: () => ({}),
}))

describe('HomePage localStorage resilience', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renders without throwing when recentAgents contains malformed JSON', () => {
    localStorage.setItem(RECENT_AGENTS_STORAGE_KEY, '{invalid-json')

    expect(() => {
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      )
    }).not.toThrow()

    // The page renders safely and does not crash
    expect(screen.getByText('Code Reviewer')).toBeInTheDocument()
    // Recently used section should safely be absent since recent list is empty
    expect(screen.queryByText(/recently used/i)).not.toBeInTheDocument()
  })

  it('renders without throwing when recentAgents contains a non-array JSON object', () => {
    localStorage.setItem(
      RECENT_AGENTS_STORAGE_KEY,
      JSON.stringify({ 'code-reviewer': true })
    )

    expect(() => {
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      )
    }).not.toThrow()

    expect(screen.getByText('Code Reviewer')).toBeInTheDocument()
    expect(screen.queryByText(/recently used/i)).not.toBeInTheDocument()
  })

  it('renders recently used section when valid recentAgents are present', () => {
    localStorage.setItem(
      RECENT_AGENTS_STORAGE_KEY,
      JSON.stringify(['code-reviewer'])
    )

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    expect(screen.getByText(/recently used/i)).toBeInTheDocument()
  })
})
