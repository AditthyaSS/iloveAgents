import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// Heavy / irrelevant presentational children are stubbed so these tests focus on
// the run lifecycle. AgentRunner, useApiKey, useHistory, usePromptHistory,
// useSessionSpend, analytics and the REAL llmAdapter.streamAgent are all live.
vi.mock('./ApiKeyBar', () => ({ default: () => null }))
vi.mock('./ApiKeyInfo', () => ({ default: () => null }))
vi.mock('./OutputRenderer', () => ({ default: ({ content }) => <div data-testid="output">{content}</div> }))
vi.mock('./VoiceInput', () => ({ default: () => null }))
vi.mock('./RunRating', () => ({ default: () => null }))
vi.mock('./SuggestedChainPills', () => ({ default: () => null }))
vi.mock('./CostEstimator', () => ({ default: () => null }))
vi.mock('./TokenCounter', () => ({ default: () => null }))
vi.mock('./BatchModeRunner', () => ({ default: () => null }))
vi.mock('./AgentPreviewPanel', () => ({ default: () => null }))
vi.mock('./PromptHistoryPanel', () => ({ default: () => null }))
vi.mock('./ScheduleAgentModal', () => ({ default: () => null }))

import AgentRunner from './AgentRunner'

const agent = {
  id: 'test-agent',
  name: 'Test Agent',
  description: 'An agent used in tests',
  category: 'Test',
  provider: 'any',
  icon: 'Bot',
  outputType: 'markdown',
  systemPrompt: 'You are a test agent.',
  inputs: [{ id: 'text', label: 'Text', type: 'textarea', required: true, placeholder: 'type here' }],
}

// ── fake `fetch` that behaves like a browser for streaming + abort ───────────
const enc = new TextEncoder()
let requests

function installFakeFetch() {
  requests = []
  globalThis.fetch = vi.fn((_url, init) => {
    const req = { signal: init.signal, controller: null, closed: false }
    const body = new ReadableStream({
      start(c) {
        req.controller = c
        // Browsers reject the pending reader.read() with a DOMException named
        // AbortError when the request's signal aborts.
        init.signal?.addEventListener('abort', () => {
          if (!req.closed) {
            req.closed = true
            c.error(new DOMException('The operation was aborted.', 'AbortError'))
          }
        })
      },
    })
    requests.push(req)
    return Promise.resolve({ ok: true, status: 200, body })
  })
}

const push = (i, text) =>
  requests[i].controller.enqueue(
    enc.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`)
  )

const finish = (i) => {
  if (requests[i].closed) return
  requests[i].closed = true
  requests[i].controller.enqueue(enc.encode('data: [DONE]\n\n'))
  requests[i].controller.close()
}

const flush = (ms = 30) => act(async () => { await new Promise((r) => setTimeout(r, ms)) })

const history = () => JSON.parse(localStorage.getItem('iloveAgents_history') || '[]')
const analyticsFor = (id) => JSON.parse(localStorage.getItem('ila_analytics') || '[]').filter((e) => e.agentId === id)

async function startRun() {
  const user = userEvent.setup()
  const utils = render(
    <MemoryRouter>
      <AgentRunner agent={agent} />
    </MemoryRouter>
  )
  await user.type(screen.getByRole('textbox'), 'some input')
  const run = screen.getByRole('button', { name: /run agent/i })
  await waitFor(() => expect(run).toBeEnabled()) // saved API key is loaded asynchronously
  await user.click(run)
  await waitFor(() => expect(requests).toHaveLength(1))
  return { user, ...utils }
}

const wrap = (key) => JSON.stringify({ key, expiresAt: Date.now() + 60_000 })

beforeEach(() => {
  sessionStorage.clear()
  localStorage.clear()
  sessionStorage.setItem('ila_apikey_openai', wrap('sk-test'))
  installFakeFetch()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('AgentRunner: stream cancellation lifecycle', () => {
  it('a normal run still completes, shows output and records history once (guard)', async () => {
    await startRun()
    await act(async () => { push(0, 'hello world'); finish(0) })
    expect(await screen.findByTestId('output')).toHaveTextContent('hello world')
    await waitFor(() => expect(history()).toHaveLength(1))
    expect(analyticsFor('test-agent')).toHaveLength(1)
  })

  it('Stop keeps the partial output and returns the UI to idle (guard)', async () => {
    const { user } = await startRun()
    await act(async () => { push(0, 'partial text') })
    await user.click(await screen.findByRole('button', { name: /stop/i }))
    await flush()
    expect(await screen.findByTestId('output')).toHaveTextContent('partial text')
    expect(screen.getByRole('button', { name: /run agent/i })).toBeInTheDocument()
  })

  it('Clear while streaming must not resurrect the cancelled output or record a run', async () => {
    const { user } = await startRun()
    await act(async () => { push(0, 'partial text that the user threw away') })

    await user.click(screen.getByRole('button', { name: /^clear$/i }))
    await flush()

    expect(screen.queryByTestId('output')).toBeNull()
    expect(history()).toHaveLength(0)
    expect(analyticsFor('test-agent')).toHaveLength(0)
    // ...and the UI is idle again, not stuck in "loading".
    expect(screen.getByRole('button', { name: /run agent/i })).toBeInTheDocument()
  })

  it('Escape while streaming behaves like Clear', async () => {
    await startRun()
    await act(async () => { push(0, 'partial') })

    fireEvent.keyDown(window, { key: 'Escape' })
    await flush()

    expect(screen.queryByTestId('output')).toBeNull()
    expect(history()).toHaveLength(0)
    expect(screen.getByRole('button', { name: /run agent/i })).toBeInTheDocument()
  })

  it("a stopped run's late cleanup must not clobber the next run's controller/loading state", async () => {
    await startRun()
    await act(async () => { push(0, 'first') })

    // Stop and immediately start a second run, before run #1's rejection has
    // propagated (the microtask that runs run #1's `finally`).
    fireEvent.click(screen.getByRole('button', { name: /stop/i }))
    fireEvent.click(screen.getByRole('button', { name: /run agent/i }))
    await flush()

    expect(requests).toHaveLength(2)
    // Run #2 is still streaming, so the UI must still be in the running state...
    const stop = screen.getByRole('button', { name: /stop/i })
    // ...and Stop must actually be able to cancel run #2.
    fireEvent.click(stop)
    expect(requests[1].signal.aborted).toBe(true)
  })

  it('unmounting mid-stream cancels the request and records nothing', async () => {
    const { unmount } = await startRun()
    await act(async () => { push(0, 'partial') })

    unmount()
    expect(requests[0].signal.aborted).toBe(true)

    await flush()
    expect(history()).toHaveLength(0)
    expect(analyticsFor('test-agent')).toHaveLength(0)
  })

  it('Stop keeps partial output visible but bills, saves, and records nothing', async () => {
    const { user } = await startRun()
    await act(async () => { push(0, 'partial text') })
    await user.click(await screen.findByRole('button', { name: /stop/i }))
    await flush()

    expect(await screen.findByTestId('output')).toHaveTextContent('partial text')
    expect(history()).toHaveLength(0)
    expect(analyticsFor('test-agent')).toHaveLength(0)
    expect(screen.getByRole('button', { name: /run agent/i })).toBeInTheDocument()
  })
})
