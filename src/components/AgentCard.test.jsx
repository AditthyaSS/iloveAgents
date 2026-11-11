import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../lib/useFavorites', () => ({
  useFavorites: () => ({ isFavorite: () => false, toggleFavorite: vi.fn() }),
}))

import AgentCard from './AgentCard'

const agent = {
  id: 'test-agent',
  name: 'Test Agent',
  description: 'Does things',
  category: 'Engineering',
  provider: 'openai',
  icon: 'Bot',
  systemPrompt: 'Be helpful.',
}

describe('AgentCard copy prompt', () => {
  it('copies system prompt and shows copied state', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(
      <MemoryRouter>
        <AgentCard agent={agent} />
      </MemoryRouter>
    )
    const btn = screen.getByRole('button', { name: /Copy prompt/i })
    fireEvent.click(btn)
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('Be helpful.'))
    expect(screen.getByRole('button', { name: /Prompt copied/i })).toBeInTheDocument()
  })
})
