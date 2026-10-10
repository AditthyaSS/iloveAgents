import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import FeedbackPage from './FeedbackPage'

describe('FeedbackPage links', () => {
  it('warns about new tabs and hides decoration', () => {
    const { container } = render(
      <MemoryRouter>
        <FeedbackPage />
      </MemoryRouter>
    )
    expect(screen.getByRole('link', { name: /report a bug.*new tab/i })).toHaveAttribute('target', '_blank')
    expect(container.querySelectorAll('svg[aria-hidden="true"]').length).toBeGreaterThan(0)
  })
})
