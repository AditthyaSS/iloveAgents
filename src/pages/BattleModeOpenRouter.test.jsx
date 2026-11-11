import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../lib/llmAdapter', () => ({
  runAgent: vi.fn(() => new Promise(() => {})),
}))

import BattleModeArena, { PROVIDERS } from './BattleModeArena'

const agent = {
  id: 'test-agent',
  name: 'Test Agent',
  category: 'Test',
  provider: 'any',
  outputType: 'text',
  systemPrompt: 'You are a test agent.',
  inputs: [],
}

function setup() {
  render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/battle/arena',
          state: {
            agent,
            inputs: {},
            apiKeys: { openai: 'a', anthropic: 'b', gemini: 'c', openrouter: 'd' },
          },
        },
      ]}
    >
      <BattleModeArena />
    </MemoryRouter>
  )
}

describe('BattleMode openrouter column', () => {
  it('lists four providers with distinct ids and models', () => {
    const ids = PROVIDERS.map((p) => p.id)
    expect(ids).toEqual(['openai', 'anthropic', 'gemini', 'openrouter'])
    const models = PROVIDERS.map((p) => p.model)
    expect(new Set(models).size).toBe(models.length)
  })

  it('renders a loading panel per provider including openrouter', () => {
    setup()
    for (const label of ['GPT-4o', 'Claude Sonnet', 'Gemini Flash', 'OpenRouter']) {
      expect(screen.getByText(`${label} is generating...`)).toBeInTheDocument()
    }
  })

  it('skips providers without keys with a key missing message', () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/battle/arena',
            state: {
              agent,
              inputs: {},
              apiKeys: { openai: 'a', anthropic: '', gemini: '', openrouter: '' },
            },
          },
        ]}
      >
        <BattleModeArena />
      </MemoryRouter>
    )
    expect(screen.getByText('GPT-4o is generating...')).toBeInTheDocument()
    expect(
      screen.getByText(/API key for Claude Sonnet is not configured/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/API key for OpenRouter is not configured/)
    ).toBeInTheDocument()
  })
})
