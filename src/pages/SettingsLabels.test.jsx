import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SettingsPage from './SettingsPage'

describe('SettingsPage labels', () => {
  it('labels key inputs, show toggles, provider select, and confirm dialog', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    )
    expect(screen.getByLabelText(/openai api key/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /show openai key/i }))
    expect(screen.getByRole('button', { name: /hide openai key/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    fireEvent.click(screen.getByRole('button', { name: /clear all keys/i }))
    expect(screen.getByRole('alertdialog', { name: /confirm clearing all keys/i })).toBeInTheDocument()
  })
})
