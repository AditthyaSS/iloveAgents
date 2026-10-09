import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Privacy from './Privacy'
import TermsOfService from './TermsOfService'

describe('legal pages', () => {
  it('renders dated time elements', () => {
    const { unmount } = render(
      <MemoryRouter>
        <Privacy />
      </MemoryRouter>
    )
    expect(screen.getByText('June 2026').closest('time')).toHaveAttribute('datetime', '2026-06')
    unmount()
    render(
      <MemoryRouter>
        <TermsOfService />
      </MemoryRouter>
    )
    expect(screen.getByText('June 2026').closest('time')).toHaveAttribute('datetime', '2026-06')
  })
})
