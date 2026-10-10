import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SchedulerPage from './SchedulerPage'

const clearResultsForJob = vi.fn()

vi.mock('../lib/useScheduler', () => ({
  SCHEDULE_OPTIONS: [{ value: 'daily', label: 'Daily' }],
  useScheduler: () => ({
    jobs: [{ id: 'j1', label: 'Daily SEO', agentName: 'SEO', schedule: 'daily', enabled: true }],
    results: [
      { id: 'r1', jobId: 'j1', output: 'one' },
      { id: 'r2', jobId: 'j1', output: 'two' },
    ],
    running: {},
    toggleJob: vi.fn(),
    deleteJob: vi.fn(),
    runJob: vi.fn(),
    deleteResult: vi.fn(),
    clearResultsForJob,
  }),
}))

describe('SchedulerPage results clear confirm', () => {
  it('arms on first click and clears only on confirm', () => {
    render(<SchedulerPage />)
    fireEvent.click(screen.getByRole('button', { name: /view results/i }))
    fireEvent.click(screen.getByRole('button', { name: /clear all/i }))
    expect(clearResultsForJob).not.toHaveBeenCalled()
    expect(screen.getByText(/clear 2\?/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^confirm$/i }))
    expect(clearResultsForJob).toHaveBeenCalledWith('j1')
  })
})
