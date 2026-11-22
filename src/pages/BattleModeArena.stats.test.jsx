import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../lib/llmAdapter', () => ({
  runAgent: vi.fn(() =>
    Promise.resolve({
      content: 'Hello world this is a test response from the model.',
      duration: 2400,
    })
  ),
}))

import BattleModeArena from './BattleModeArena'

const agent = {
  id: 'test-agent',
  name: 'Test Agent',
  category: 'Test',
  provider: 'any',
  outputType: 'markdown',
  systemPrompt: 'You are a test agent.',
  inputs: [],
}

describe('BattleMode response statistics panel', () => {
  it('displays response statistics when model completes generation', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/battle/arena',
            state: {
              agent,
              inputs: {},
              apiKeys: { openai: 'test-key' },
            },
          },
        ]}
      >
        <BattleModeArena />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText('Response Statistics').length).toBeGreaterThan(0)
    })

    expect(screen.getAllByText('Words').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Characters').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Tokens (est.)').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Duration').length).toBeGreaterThan(0)
    expect(screen.getAllByText('2.4s').length).toBeGreaterThan(0)
  })
})
