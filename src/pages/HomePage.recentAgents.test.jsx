import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AgentsProvider } from '../lib/useAgents'
import HomePage from './HomePage'

const renderHome = () =>
  render(
    <MemoryRouter>
      <AgentsProvider>
        <HomePage />
      </AgentsProvider>
    </MemoryRouter>
  )

beforeEach(() => {
  localStorage.clear()
})

describe('HomePage and the recently used rail', () => {
  it('renders when recentAgents holds invalid JSON', async () => {
    localStorage.setItem('recentAgents', '{invalid-json')

    renderHome()

    // The page must survive the corrupt store: rendering used to throw a
    // SyntaxError inside the useMemo that builds the recent list.
    expect(await screen.findByPlaceholderText(/search agents/i)).toBeInTheDocument()
    expect(screen.queryByText(/recently used/i)).not.toBeInTheDocument()
  })

  it('renders when recentAgents holds JSON that is not an array', async () => {
    localStorage.setItem('recentAgents', '{"code-reviewer":true}')

    renderHome()

    expect(await screen.findByPlaceholderText(/search agents/i)).toBeInTheDocument()
    expect(screen.queryByText(/recently used/i)).not.toBeInTheDocument()
  })

  it('still lists the agent when recentAgents holds valid ids', async () => {
    localStorage.setItem('recentAgents', JSON.stringify(['code-reviewer']))

    renderHome()

    // The same card also appears in the main grid, so scope the assertion to
    // the recently used rail itself.
    const heading = await screen.findByText(/recently used/i)
    const rail = heading.closest('div.premium-section')
    expect(rail).not.toBeNull()
    expect(within(rail).getByRole('link', { name: /code reviewer/i })).toBeInTheDocument()
  })
})