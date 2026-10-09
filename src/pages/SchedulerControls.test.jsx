import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SchedulerPage from './SchedulerPage'

vi.mock('../lib/useScheduler', () => ({
  SCHEDULE_OPTIONS: [],
  useScheduler: () => ({
    jobs: [
      {
        id: 'j1', label: 'Morning Brief', agentName: 'Summarizer', enabled: true,
        schedule: 'daily', lastRunAt: null, nextRunAt: Date.now() + 1000, apiKey: 'k',
      },
    ],
    results: [],
    running: {},
    toggleJob: vi.fn(),
    runJob: vi.fn(),
    deleteJob: vi.fn(),
    deleteResult: vi.fn(),
    clearResultsForJob: vi.fn(),
  }),
}))
vi.mock('../components/OutputRenderer', () => ({ default: () => null }))

describe('SchedulerPage controls', () => {
  it('names icon controls and regions', () => {
    render(
      <MemoryRouter>
        <SchedulerPage />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: /pause morning brief/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: /run morning brief now/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete morning brief/i })).toBeInTheDocument()
  })
})
