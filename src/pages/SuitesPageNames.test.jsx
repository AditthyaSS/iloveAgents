import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import SuitesPage from './SuitesPage'
import { generateCustomSuite } from '../lib/customSuiteGenerator'

vi.mock('../lib/customSuiteGenerator', () => ({
  generateCustomSuite: vi.fn(),
}))
vi.mock('../lib/useApiKey', () => ({
  useApiKey: () => ({
    provider: 'openai',
    setProvider: vi.fn(),
    apiKey: 'sk-test',
    setApiKey: vi.fn(),
    saveForSession: true,
    setSaveForSession: vi.fn(),
  }),
}))
vi.mock('../lib/useAgents', () => {
  const agents = [{ id: 'a1', name: 'Agent One' }]
  return { useAgents: () => ({ agents }) }
})
vi.mock('../components/ApiKeyBar', () => ({ default: () => null }))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('SuitesPage agent names', () => {
  it('shows resolved names and blocks unknown ids', async () => {
    generateCustomSuite.mockResolvedValue({
      title: 'Kit',
      description: 'd',
      agents: [
        { id: 'a1', reason: 'r1' },
        { id: 'ghost-agent', reason: 'r2' },
      ],
    })
    render(
      <MemoryRouter>
        <SuitesPage />
      </MemoryRouter>
    )
    fireEvent.change(screen.getByPlaceholderText(/goldman sachs/i), { target: { value: 'go' } })
    fireEvent.click(screen.getByRole('button', { name: /^generate$/i }))
    await act(async () => {})
    expect(screen.getByText('Agent One')).toBeInTheDocument()
    fireEvent.click(screen.getAllByText('Open')[1])
    expect(mockNavigate).not.toHaveBeenCalled()
    fireEvent.click(screen.getAllByText('Open')[0])
    expect(mockNavigate).toHaveBeenCalledWith('/agent/a1')
  })
})
