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
  const agents = []
  return { useAgents: () => ({ agents }) }
})
vi.mock('../components/ApiKeyBar', () => ({ default: () => null }))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('SuitesPage custom suite', () => {
  it('dedupes generated agents and blocks empty workflow creation', async () => {
    generateCustomSuite.mockResolvedValue({
      title: 'Launch Kit',
      description: 'd',
      agents: [
        { id: 'a1', reason: 'r1' },
        { id: 'a1', reason: 'r1 again' },
      ],
    })
    render(
      <MemoryRouter>
        <SuitesPage />
      </MemoryRouter>
    )
    fireEvent.change(screen.getByPlaceholderText(/goldman sachs/i), { target: { value: 'launch' } })
    fireEvent.click(screen.getByRole('button', { name: /^generate$/i }))
    await act(async () => {})
    expect(screen.getAllByText('Open')).toHaveLength(1)
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('ignores workflow creation for empty suites', async () => {
    generateCustomSuite.mockResolvedValue({ title: 'Empty', description: 'd', agents: [] })
    render(
      <MemoryRouter>
        <SuitesPage />
      </MemoryRouter>
    )
    fireEvent.change(screen.getByPlaceholderText(/goldman sachs/i), { target: { value: 'x' } })
    fireEvent.click(screen.getByRole('button', { name: /^generate$/i }))
    await act(async () => {})
    fireEvent.click(screen.getByRole('button', { name: /create workflow/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
