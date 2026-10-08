import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SuitesPage from './SuitesPage'
import { generateCustomSuite } from '../lib/customSuiteGenerator'

vi.mock('../lib/customSuiteGenerator', () => ({
  generateCustomSuite: vi.fn(),
}))
vi.mock('../lib/useApiKey', () => ({
  useApiKey: () => ({
    provider: 'openai',
    setProvider: vi.fn(),
    apiKey: '',
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

describe('SuitesPage generate feedback', () => {
  it('explains missing goal or key instead of silently ignoring', () => {
    render(
      <MemoryRouter>
        <SuitesPage />
      </MemoryRouter>
    )
    const box = screen.getByPlaceholderText(/goldman sachs/i)
    fireEvent.change(box, { target: { value: 'launch' } })
    fireEvent.keyDown(box, { key: 'Enter' })
    expect(screen.getByRole('alert')).toHaveTextContent(/api key/i)
    expect(generateCustomSuite).not.toHaveBeenCalled()
  })
})
