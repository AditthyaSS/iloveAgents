import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RunRating from './RunRating'

vi.mock('../lib/useAgentRatings.js', () => ({
  useAgentRatings: () => ({ rateAgent: vi.fn() }),
}))

describe('RunRating controls', () => {
  it('names rating buttons and confirms submission', () => {
    render(<RunRating agentId="a1" />)
    fireEvent.click(screen.getByLabelText(/rate output good/i))
    expect(screen.getByRole('status')).toHaveTextContent(/thank you/i)
  })

  it('names the negative button', () => {
    render(<RunRating agentId="a1" />)
    expect(screen.getByLabelText(/rate output bad/i)).toBeInTheDocument()
  })
})
