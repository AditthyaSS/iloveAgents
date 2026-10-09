import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AgentPreviewPanel from './AgentPreviewPanel'

const agent = {
  id: 'a1', name: 'Agent One', description: 'd', category: 'Test',
  provider: 'openai', icon: 'Bot', systemPrompt: 'Be helpful.', inputs: [],
}

describe('AgentPreviewPanel disclosure', () => {
  it('exposes expansion state and region', () => {
    render(
      <MemoryRouter>
        <AgentPreviewPanel agent={agent} />
      </MemoryRouter>
    )
    const toggle = screen.getByRole('button', { name: /system prompt/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('region')).toHaveTextContent('Be helpful.')
  })
})
