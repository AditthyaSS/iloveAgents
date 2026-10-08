import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

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
  id: 'coalesce-agent',
  name: 'Coalesce Agent',
  description: 'An agent used in tests',
  category: 'Test',
  provider: 'any',
  icon: 'Bot',
  outputType: 'markdown',
  systemPrompt: 'You are a test agent.',
  inputs: [{ id: 'text', label: 'Text', type: 'textarea', required: true, placeholder: 'type here' }],
}

const enc = new TextEncoder()
let requests

function installFakeFetch() {
  requests = []
  globalThis.fetch = vi.fn((_url, init) => {
    const req = { signal: init.signal, controller: null, closed: false }
    const body = new ReadableStream({
      start(c) {
        req.controller = c
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

describe('AgentRunner chunk coalescing', () => {
  it('stopping before the flush window still shows every buffered token', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AgentRunner agent={agent} />
      </MemoryRouter>
    )
    await user.type(screen.getByRole('textbox'), 'some input')
    const run = screen.getByRole('button', { name: /run agent/i })
    await user.click(run)
    await act(async () => {
      push(0, 'alpha-')
      push(0, 'beta-')
      push(0, 'gamma')
    })
    fireEvent.click(screen.getByRole('button', { name: /stop/i }))
    expect(await screen.findByTestId('output')).toHaveTextContent('alpha-beta-gamma')
  })
})
