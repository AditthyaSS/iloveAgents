import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from './Navbar'

describe('Navbar mobile menu visibility', () => {
  it('hides collapsed links from keyboard and assistive tech', () => {
    render(
      <MemoryRouter>
        <Navbar sidebarOpen={false} setSidebarOpen={vi.fn()} onStartTour={vi.fn()} />
      </MemoryRouter>
    )
    const toggle = screen.getByRole('button', { name: /toggle navigation menu/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    const panel = screen.getByText('Star on GitHub').closest('div.md\\:hidden')
    expect(panel.className).toMatch(/invisible/)
    const homeLinks = screen.getAllByRole('link', { name: /homepage/i })
    expect(homeLinks).toHaveLength(1)
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(panel.className).toMatch(/visible/)
    expect(panel.className).not.toMatch(/invisible/)
  })
})
