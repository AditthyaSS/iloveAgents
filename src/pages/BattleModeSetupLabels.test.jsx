import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BattleModeSetup from './BattleModeSetup'

vi.mock('../lib/useAgents', () => {
  const agents = [
    {
      id: 'a1', name: 'Agent One', description: 'd', category: 'Test',
      provider: 'any', icon: 'Bot', outputType: 'text', systemPrompt: 'sys',
      inputs: [{ id: 'topic', label: 'Topic', type: 'text', required: true, placeholder: 'Type here' }],
    },
  ]
  return { useAgents: () => ({ agents, loading: false }) }
})

vi.mock('../lib/useApiKey', () => ({
  useApiKey: () => ({
    provider: 'openai',
    setProvider: vi.fn(),
    apiKey: 'sk-test',
    setApiKey: vi.fn(),
    saveForSession: false,
    setSaveForSession: vi.fn(),
  }),
}))

describe('BattleModeSetup input labels', () => {
  it('links labels to controls and announces errors', () => {
    render(
      <MemoryRouter>
        <BattleModeSetup />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: /agent one/i }))
    const box = screen.getByLabelText('Topic')
    expect(box).toHaveAttribute('aria-invalid', 'false')
    fireEvent.change(box, { target: { value: 'x'.repeat(5000) } })
    expect(box).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
