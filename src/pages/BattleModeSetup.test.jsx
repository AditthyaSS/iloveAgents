import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BattleModeSetup from './BattleModeSetup'
import { useAgents } from '../lib/useAgents'

vi.mock('../lib/useAgents', () => ({
  useAgents: vi.fn(() => ({ agents: [], loading: false })),
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

  it('renders API key dashboard guide links for each provider in configuration step', () => {
    vi.mocked(useAgents).mockReturnValue({
      agents: [
        {
          id: 'test-agent',
          name: 'Test Agent',
          description: 'A test agent',
          category: 'Engineering',
          inputs: [],
        },
      ],
      loading: false,
    })

    render(
      <MemoryRouter>
        <BattleModeSetup />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Test Agent'))

    const guideLinks = screen.getAllByRole('link', { name: /Get key/i })
    expect(guideLinks.length).toBe(4)
    expect(guideLinks[0]).toHaveAttribute('href', 'https://platform.openai.com/api-keys')
    expect(guideLinks[1]).toHaveAttribute('href', 'https://console.anthropic.com/settings/keys')
    expect(guideLinks[2]).toHaveAttribute('href', 'https://aistudio.google.com/app/apikey')
    expect(guideLinks[3]).toHaveAttribute('href', 'https://openrouter.ai/keys')
  })
})
