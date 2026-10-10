import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ApiKeyInfo from './ApiKeyInfo'

describe('ApiKeyInfo disclosure', () => {
  it('toggles by keyboard with state', () => {
    render(<ApiKeyInfo provider="openai" url="https://example.com" />)
    const trigger = screen.getByRole('button', { name: /where to get .* api key/i })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: /open .* dashboard/i })).toBeInTheDocument()
  })
})
