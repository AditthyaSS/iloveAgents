import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: vi.fn(),
}))

vi.mock('../lib/useSessionSpend', () => ({
  useSessionSpend: () => ({
    totalSpend: 0,
    runs: [],
    clearSession: vi.fn(),
  }),
}))

import Navbar from './Navbar'

describe('Navbar mobile navigation', () => {
  it('removes collapsed navigation controls from the accessibility tree', () => {
    render(
      <MemoryRouter>
        <Navbar sidebarOpen={false} setSidebarOpen={vi.fn()} />
      </MemoryRouter>
    )

    expect(screen.queryByLabelText('Mobile navigation')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Toggle navigation menu' }))

    expect(screen.getByLabelText('Mobile navigation')).toBeInTheDocument()
  })

  it('closes the open mobile navigation with Escape', () => {
    render(
      <MemoryRouter>
        <Navbar sidebarOpen={false} setSidebarOpen={vi.fn()} />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Toggle navigation menu' }))
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByLabelText('Mobile navigation')).not.toBeInTheDocument()
  })

  it('returns focus to the menu toggle when Escape closes it from a mobile link', () => {
    render(
      <MemoryRouter>
        <Navbar sidebarOpen={false} setSidebarOpen={vi.fn()} />
      </MemoryRouter>
    )

    const toggle = screen.getByRole('button', { name: 'Toggle navigation menu' })
    fireEvent.click(toggle)

    const agentsLink = within(screen.getByLabelText('Mobile navigation')).getByRole('link', {
      name: 'Agents',
    })
    agentsLink.focus()
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByLabelText('Mobile navigation')).not.toBeInTheDocument()
    expect(toggle).toHaveFocus()
  })
})
