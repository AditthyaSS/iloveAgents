import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BattleModeSetup from './BattleModeSetup'

vi.mock('../lib/useAgents', () => {
  const agents = []
  return { useAgents: () => ({ agents, loading: false }) }
})

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

describe('BattleModeSetup steps', () => {
  it('announces the step list and current step', () => {
    render(
      <MemoryRouter>
        <BattleModeSetup />
      </MemoryRouter>
    )
    expect(screen.getByRole('list', { name: /battle setup progress/i })).toBeInTheDocument()
    expect(screen.getByText(/step 1 of 2 \(current step\)/i)).toBeInTheDocument()
  })
})
