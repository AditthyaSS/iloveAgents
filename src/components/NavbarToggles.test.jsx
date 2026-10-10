import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from './Navbar'

describe('Navbar toggle states', () => {
  it('exposes sidebar, theme, and menu state', () => {
    const { rerender } = render(
      <MemoryRouter>
        <Navbar sidebarOpen={false} setSidebarOpen={vi.fn()} onStartTour={vi.fn()} />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: /toggle sidebar/i })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
    expect(screen.getByRole('button', { name: /switch to light theme/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    rerender(
      <MemoryRouter>
        <Navbar sidebarOpen onClose={() => {}} setSidebarOpen={vi.fn()} onStartTour={vi.fn()} />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: /toggle sidebar/i })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    fireEvent.click(screen.getByRole('button', { name: /toggle navigation menu/i }))
    expect(screen.getByRole('button', { name: /toggle navigation menu/i })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
  })
})
