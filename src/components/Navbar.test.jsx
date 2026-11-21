import { fireEvent, render, screen } from '@testing-library/react'
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
})
