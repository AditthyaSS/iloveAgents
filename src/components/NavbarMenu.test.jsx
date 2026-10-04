import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from './Navbar'

describe('Navbar mobile menu dismiss', () => {
  it('closes on Escape and refocuses the toggle', () => {
    render(
      <MemoryRouter>
        <Navbar sidebarOpen={false} setSidebarOpen={() => {}} onStartTour={() => {}} />
      </MemoryRouter>
    )
    const toggle = screen.getByRole('button', { name: /toggle navigation menu/i })
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(document.activeElement).toBe(toggle)
  })
})
