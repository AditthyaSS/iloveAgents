import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BattleModeSetup from './BattleModeSetup'

vi.mock('../lib/useAgents', () => ({
  useAgents: () => ({ agents: [], loading: false }),
}))

vi.mock('../lib/useApiKey', () => ({
  useApiKey: () => ({
    provider: 'openai',
    setProvider: vi.fn(),
    apiKey: '',
    setApiKey: vi.fn(),
    saveForSession: false,
    setSaveForSession: vi.fn(),
  }),
}))

describe('BattleModeSetup copy', () => {
  it('names all four battle models', () => {
    render(
      <MemoryRouter>
        <BattleModeSetup />
      </MemoryRouter>
    )
    expect(screen.getByText(/GPT-4o, Claude Sonnet, Gemini Flash and OpenRouter/i)).toBeInTheDocument()
  })
})
