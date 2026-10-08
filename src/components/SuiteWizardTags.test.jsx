import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SuiteWizard from './SuiteWizard'

vi.mock('../lib/useAgents', () => {
  const agents = []
  return { useAgents: () => ({ agents }) }
})

const malformedSuite = {
  id: 'm', name: 'Malformed Suite', icon: 'Code2', color: '#fff', agents: [],
  quiz: {
    questions: [
      { question: 'Q1?', options: [{ label: 'Only option' }] },
    ],
  },
}

describe('SuiteWizard malformed quiz', () => {
  it('tallies options without tags instead of crashing', () => {
    render(
      <MemoryRouter>
        <SuiteWizard suite={malformedSuite} onBack={vi.fn()} />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByText('Only option'))
    fireEvent.click(screen.getByText('Next'))
    expect(screen.queryByText('Q1?')).toBeNull()
  })
})
