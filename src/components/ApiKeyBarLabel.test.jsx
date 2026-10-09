import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ApiKeyBar from './ApiKeyBar'

describe('ApiKeyBar input label', () => {
  it('names the key input per provider', () => {
    render(
      <MemoryRouter>
        <ApiKeyBar
          provider="openai"
          setProvider={vi.fn()}
          apiKey=""
          setApiKey={vi.fn()}
          saveForSession={false}
          setSaveForSession={vi.fn()}
          agentProvider="any"
          model="gpt-4o"
          setModel={vi.fn()}
        />
      </MemoryRouter>
    )
    expect(screen.getByLabelText(/openai api key/i)).toBeInTheDocument()
  })
})
