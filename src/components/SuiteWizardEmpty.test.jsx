import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SuiteWizard from './SuiteWizard'

vi.mock('../lib/useAgents', () => {
  const agents = []
  return { useAgents: () => ({ agents }) }
})

const emptyQuizSuite = { id: 's1', name: 'Empty Suite', icon: 'Code2', color: '#fff', agents: [], quiz: { questions: [] } }
const noQuizSuite = { id: 's2', name: 'No Quiz Suite', icon: 'Code2', color: '#fff', agents: [] }

describe('SuiteWizard empty quiz', () => {
  it('renders an empty state instead of crashing without questions', () => {
    render(
      <MemoryRouter>
        <SuiteWizard suite={emptyQuizSuite} onBack={vi.fn()} />
      </MemoryRouter>
    )
    expect(screen.getByText(/no quiz questions/i)).toBeInTheDocument()
  })

  it('renders an empty state when quiz is missing', () => {
    render(
      <MemoryRouter>
        <SuiteWizard suite={noQuizSuite} onBack={vi.fn()} />
      </MemoryRouter>
    )
    expect(screen.getByText(/no quiz questions/i)).toBeInTheDocument()
  })
})
