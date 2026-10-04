import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('../lib/llmAdapter', () => ({
  streamAgent: vi.fn(async () => ({ content: 'ok', duration: 1 })),
}))
vi.mock('../lib/useAnalytics', () => ({ recordAnalyticsRun: vi.fn() }))
vi.mock('../components/OutputRenderer', () => ({
  default: ({ content }) => <div data-testid="output">{content}</div>,
}))

import SchedulerPage from './SchedulerPage'

const JOBS_KEY = 'ila_scheduled_jobs'
const KEY_PREFIX = 'ila_scheduler_key_'

const seedJob = (overrides = {}) => {
  const job = {
    id: 'job_nightly',
    agentId: 'code-reviewer',
    agentName: 'Code Reviewer',
    agentDefinition: { id: 'code-reviewer', name: 'Code Reviewer', provider: 'openai', inputs: [] },
    inputs: {},
    provider: 'openai',
    model: 'gpt-4o',
    schedule: 'daily',
    createdAt: Date.now(),
    lastRunAt: null,
    nextRunAt: Date.now() + 60_000,
    enabled: true,
    label: 'Nightly review',
    ...overrides,
  }
  localStorage.setItem(JOBS_KEY, JSON.stringify([job]))
  return job
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

describe('SchedulerPage when a job lost its key', () => {
  it('warns that the job cannot run instead of showing it as active', () => {
    seedJob()

    render(<SchedulerPage />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      '1 scheduled job cannot run without its API key'
    )
    expect(screen.getByText('API key required')).toBeInTheDocument()
    // No countdown, because there is no run to count down to.
    expect(screen.queryByText(/^Next:/)).not.toBeInTheDocument()
    expect(screen.getByLabelText('API key for Nightly review')).toBeInTheDocument()
  })

  it('keeps the run now action disabled while the key is missing', () => {
    seedJob()

    render(<SchedulerPage />)

    expect(screen.getByTitle('Add an API key before running this job')).toBeDisabled()
  })

  it('drops the warning once the key is entered again', async () => {
    seedJob()
    const user = userEvent.setup()

    render(<SchedulerPage />)

    await user.type(screen.getByLabelText('API key for Nightly review'), 'sk-reentered')
    await user.click(screen.getByRole('button', { name: /save key/i }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByText('API key required')).not.toBeInTheDocument()
    expect(sessionStorage.getItem(KEY_PREFIX + 'job_nightly')).toBe('sk-reentered')
  })

  it('shows the next run without a warning when the session still has the key', () => {
    seedJob()
    sessionStorage.setItem(KEY_PREFIX + 'job_nightly', 'sk-session')

    render(<SchedulerPage />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText(/^Next:/)).toBeInTheDocument()
  })

  it('does not warn about a job the user paused', () => {
    seedJob({ enabled: false })

    render(<SchedulerPage />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('Paused')).toBeInTheDocument()
  })
})
