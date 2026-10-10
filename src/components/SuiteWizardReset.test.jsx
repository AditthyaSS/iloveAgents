import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SuiteWizard from './SuiteWizard'

vi.mock('../lib/useAgents', () => {
  const agents = []
  return { useAgents: () => ({ agents }) }
})

const suiteA = {
  id: 'a', name: 'Suite A', icon: 'Code2', color: '#fff', agents: [],
  quiz: {
    questions: [
      { question: 'A1?', options: [{ label: 'A1a', tags: [] }, { label: 'A1b', tags: [] }] },
      { question: 'A2?', options: [{ label: 'A2a', tags: [] }, { label: 'A2b', tags: [] }] },
    ],
  },
}
const suiteB = {
  id: 'b', name: 'Suite B', icon: 'Code2', color: '#fff', agents: [],
  quiz: {
    questions: [
      { question: 'B1?', options: [{ label: 'B1a', tags: [] }] },
    ],
  },
}

describe('SuiteWizard suite change', () => {
  it('resets progress when the suite changes', () => {
    const { rerender } = render(
      <MemoryRouter>
        <SuiteWizard suite={suiteA} onBack={vi.fn()} />
      </MemoryRouter>
    )
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument()
    fireEvent.click(screen.getByText('A1a'))
    rerender(
      <MemoryRouter>
        <SuiteWizard suite={suiteB} onBack={vi.fn()} />
      </MemoryRouter>
    )
    expect(screen.getByText('Question 1 of 1')).toBeInTheDocument()
    expect(screen.getByText('B1?')).toBeInTheDocument()
  })
})
