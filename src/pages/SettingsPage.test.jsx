import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SettingsPage from './SettingsPage'
import { getGlobalKeys, clearAllGlobalKeys } from '../lib/globalKeys'

describe('SettingsPage API Key Validation & Saving', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    clearAllGlobalKeys()
    vi.clearAllMocks()
  })

  it('renders all API key fields and Save Keys button', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /^Settings$/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/OpenAI API Key/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Anthropic API Key/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Google Gemini API Key/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/OpenRouter API Key/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Save Keys/i })).toBeInTheDocument()
  })

  it('shows validation error and prevents saving when all API key fields are empty', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    )

    const saveButton = screen.getByRole('button', { name: /Save Keys/i })
    fireEvent.click(saveButton)

    // Validation error must be displayed
    expect(
      screen.getByText('Please enter at least one API key before saving.')
    ).toBeInTheDocument()

    // Success notification must NOT be displayed
    expect(screen.queryByText(/Keys saved successfully/i)).not.toBeInTheDocument()

    // No keys should be persisted in storage
    const stored = getGlobalKeys()
    expect(stored.openai).toBe('')
    expect(stored.anthropic).toBe('')
    expect(stored.gemini).toBe('')
    expect(stored.openrouter).toBe('')
  })

  it('shows validation error when fields contain only whitespace', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    )

    const openaiInput = screen.getByLabelText(/OpenAI API Key/i)
    fireEvent.change(openaiInput, { target: { value: '    ' } })

    const anthropicInput = screen.getByLabelText(/Anthropic API Key/i)
    fireEvent.change(anthropicInput, { target: { value: '  ' } })

    const saveButton = screen.getByRole('button', { name: /Save Keys/i })
    fireEvent.click(saveButton)

    // Validation error must be displayed
    expect(
      screen.getByText('Please enter at least one API key before saving.')
    ).toBeInTheDocument()

    // Success notification must NOT be displayed
    expect(screen.queryByText(/Keys saved successfully/i)).not.toBeInTheDocument()

    // No keys persisted
    const stored = getGlobalKeys()
    expect(stored.openai).toBe('')
    expect(stored.anthropic).toBe('')
  })

  it('clears error message when user types into a key input field', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    )

    const saveButton = screen.getByRole('button', { name: /Save Keys/i })
    fireEvent.click(saveButton)

    expect(
      screen.getByText('Please enter at least one API key before saving.')
    ).toBeInTheDocument()

    // Typing into any field clears the error
    const openaiInput = screen.getByLabelText(/OpenAI API Key/i)
    fireEvent.change(openaiInput, { target: { value: 's' } })

    expect(
      screen.queryByText('Please enter at least one API key before saving.')
    ).not.toBeInTheDocument()
  })

  it('saves valid keys correctly and shows success notification', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    )

    const openaiInput = screen.getByLabelText(/OpenAI API Key/i)
    fireEvent.change(openaiInput, { target: { value: 'sk-test-valid-openai-key' } })

    const saveButton = screen.getByRole('button', { name: /Save Keys/i })
    fireEvent.click(saveButton)

    // Success message displayed
    expect(screen.getByText(/Keys saved successfully/i)).toBeInTheDocument()

    // Error message not displayed
    expect(
      screen.queryByText('Please enter at least one API key before saving.')
    ).not.toBeInTheDocument()

    // Stored keys reflect saved key
    const stored = getGlobalKeys()
    expect(stored.openai).toBe('sk-test-valid-openai-key')
    expect(stored.anthropic).toBe('')

    // "Saved" badge is shown
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })

  it('saves multiple valid keys correctly', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    )

    const geminiInput = screen.getByLabelText(/Google Gemini API Key/i)
    fireEvent.change(geminiInput, { target: { value: 'AIzaSyValidKey123' } })

    const openrouterInput = screen.getByLabelText(/OpenRouter API Key/i)
    fireEvent.change(openrouterInput, { target: { value: 'sk-or-valid-key-456' } })

    const saveButton = screen.getByRole('button', { name: /Save Keys/i })
    fireEvent.click(saveButton)

    expect(screen.getByText(/Keys saved successfully/i)).toBeInTheDocument()

    const stored = getGlobalKeys()
    expect(stored.gemini).toBe('AIzaSyValidKey123')
    expect(stored.openrouter).toBe('sk-or-valid-key-456')

    const savedBadges = screen.getAllByText('Saved')
    expect(savedBadges).toHaveLength(2)
  })
})
