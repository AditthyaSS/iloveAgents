import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ApiKeyInfo from './ApiKeyInfo'

describe('ApiKeyInfo keyboard access', () => {
  it('exposes a focusable trigger linked to the panel', () => {
    render(<ApiKeyInfo provider="OpenAI" url="https://example.com" />)
    const trigger = screen.getByRole('button', { name: /Where to get a OpenAI API key/i })
    expect(trigger).toHaveAttribute('tabindex', '0')
    fireEvent.focus(trigger)
    const panel = screen.getByText('Get your OpenAI API key').closest('div[id]')
    expect(panel).toHaveAttribute('id', 'apikey-tip-OpenAI')
    expect(panel.className).toMatch(/group-focus-within:block/)
  })
})
