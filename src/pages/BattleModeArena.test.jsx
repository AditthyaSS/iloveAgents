import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import BattleModeArena from './BattleModeArena'
import { runAgent } from '../lib/llmAdapter'
import { recordAnalyticsRun } from '../lib/useAnalytics'

vi.mock('../lib/llmAdapter', () => ({
  runAgent: vi.fn(),
}))
vi.mock('../lib/useAnalytics', () => ({
  recordAnalyticsRun: vi.fn(),
}))

const agent = {
  id: 'arena-agent',
  name: 'Arena Agent',
  category: 'Test',
  systemPrompt: 'sys',
  outputType: 'text',
  provider: 'any',
  inputs: [{ id: 'topic', label: 'Topic', type: 'text' }],
}

function setup(apiKeys = { openai: 'k-test' }) {
  return render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/battle/arena',
          state: { agent, inputs: { topic: 'hi' }, apiKeys },
        },
      ]}
    >
      <Routes>
        <Route path="/battle/arena" element={<BattleModeArena />} />
      </Routes>
    </MemoryRouter>
  )
}

function pendingRun() {
  runAgent.mockImplementationOnce(
    (_args, opts) =>
      new Promise((_, reject) => {
        if (opts?.signal?.aborted) {
          reject(new DOMException('aborted', 'AbortError'))
          return
        }
        opts?.signal?.addEventListener(
          'abort',
          () => reject(new DOMException('aborted', 'AbortError')),
          { once: true }
        )
      })
  )
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

describe('BattleModeArena settle', () => {
  it('labels a 60s timeout as a timeout, not a cancellation', async () => {
    pendingRun()
    setup()
    await act(async () => {})
    expect(runAgent).toHaveBeenCalledTimes(1)
    await act(async () => {
      vi.advanceTimersByTime(60_000)
    })
    await act(async () => {
      vi.advanceTimersByTime(60_000)
    })
    await act(async () => {})
    expect(screen.getByText(/took too long/i)).toBeInTheDocument()
    expect(recordAnalyticsRun).not.toHaveBeenCalled()
  })

  it('unmounting settles silently without analytics', async () => {
    pendingRun()
    const { unmount } = setup()
    await act(async () => {})
    unmount()
    await act(async () => {
      vi.advanceTimersByTime(60_000)
    })
    expect(recordAnalyticsRun).not.toHaveBeenCalled()
  })
})
