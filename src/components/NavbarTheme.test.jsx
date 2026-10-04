import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from './Navbar'

function blockStorage() {
  const err = () => {
    const e = new Error('Access denied')
    e.name = 'SecurityError'
    throw e
  }
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(err)
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(err)
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(err)
}

describe('Navbar blocked storage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('mounts on the default theme instead of throwing', () => {
    blockStorage()
    expect(() => {
      render(
        <MemoryRouter>
          <Navbar sidebarOpen={false} setSidebarOpen={() => {}} onStartTour={() => {}} />
        </MemoryRouter>
      )
    }).not.toThrow()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('toggles the theme in memory when writes fail', () => {
    blockStorage()
    render(
      <MemoryRouter>
        <Navbar sidebarOpen={false} setSidebarOpen={() => {}} onStartTour={() => {}} />
      </MemoryRouter>
    )
    const toggle = screen.getByRole('button', { name: /toggle theme/i })
    expect(() => fireEvent.click(toggle)).not.toThrow()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
