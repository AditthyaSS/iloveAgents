import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SuiteWizard from './SuiteWizard'

vi.mock('../lib/useAgents', () => {
  const agents = [{ id: 'a1', name: 'Agent One' }]
  return { useAgents: () => ({ agents }) }
})

const suite = {
  id: 's', name: 'Suite', icon: 'Code2', color: '#fff', agents: ['a1'],
  quiz: {
    questions: [
      { question: 'Q1?', options: [{ label: 'Q1a', tags: ['a1'] }, { label: 'Q1b', tags: [] }] },
      { question: 'Q2?', options: [{ label: 'Q2a', tags: [] }] },
    ],
  },
}

describe('SuiteWizard skip', () => {
  it('does not count a skipped question answered earlier', () => {
    render(
      <MemoryRouter>
        <SuiteWizard suite={suite} onBack={vi.fn()} />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByText('Q1a'))
    fireEvent.click(screen.getByText('Next'))
    expect(screen.getByText('Q2?')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Previous'))
    fireEvent.click(screen.getByText(/skip this question/i))
    expect(screen.getByText('Q2?')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Q2a'))
    fireEvent.click(screen.getByText('Next'))
    expect(screen.queryByText('Q1?')).toBeNull()
    expect(screen.queryByText('Q2?')).toBeNull()
  })
})
