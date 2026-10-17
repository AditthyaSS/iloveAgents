import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

// ── Mocks ────────────────────────────────────────────────────────────────────
const runAgentMock = vi.fn()

vi.mock('../lib/llmAdapter', () => ({
    runAgent: (...args) => runAgentMock(...args),
}))

vi.mock('../agents/registry', () => ({
    loadAllAgents: () =>
        Promise.resolve([
            // Provider-agnostic agent: uses whatever provider the user selected.
            { id: 'summarizer-any', name: 'Any Agent', provider: 'any', category: 'Test', systemPrompt: 'sys-any' },
            // Provider-locked agent (mirrors the real `pdf-summarizer`, which is anthropic-only).
            { id: 'pinned-anthropic', name: 'Anthropic Agent', provider: 'anthropic', category: 'Test', systemPrompt: 'sys-ant' },
        ]),
}))

vi.mock('../hooks/useWorkflows', () => ({
    fetchWorkflowById: vi.fn(),
    incrementUsage: vi.fn(() => Promise.resolve({ error: null })),
}))

// Keep the tests focused on run logic, not on heavy presentational children.
vi.mock('../components/ApiKeyBar', () => ({ default: () => null }))
vi.mock('../components/OutputRenderer', () => ({ default: ({ content }) => <div>{content}</div> }))
vi.mock('../components/RunRating', () => ({ default: () => null }))

import WorkflowRunner from './WorkflowRunner'

const workflow = {
    id: 'wf-1',
    title: 'Mixed Provider Workflow',
    agents: ['summarizer-any', 'pinned-anthropic'],
}

// Keys are stored exactly as useApiKey.js / globalKeys.js write them:
// a JSON wrapper with an expiry, NOT the bare key string.
const wrap = (key, expiresAt = Date.now() + 60_000) => JSON.stringify({ key, expiresAt })

function renderRunner() {
    return render(
        <MemoryRouter initialEntries={[{ pathname: '/workflows/wf-1/run', state: { workflow } }]}>
            <Routes>
                <Route path="/workflows/:id/run" element={<WorkflowRunner />} />
            </Routes>
        </MemoryRouter>
    )
}

async function runWorkflow() {
    const user = userEvent.setup()
    renderRunner()
    // Wait for agents to load and the initial steps to be built, and for the
    // saved OpenAI key to be picked up (button is disabled until then).
    const textarea = await screen.findByPlaceholderText(/paste your main input/i)
    await user.type(textarea, 'hello world')
    const button = await screen.findByRole('button', { name: /run workflow/i })
    await waitFor(() => expect(button).toBeEnabled())
    await user.click(button)
}

beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    runAgentMock.mockReset()
    runAgentMock.mockResolvedValue({ content: 'agent output', tokens: 1, duration: 5 })
    // The user has only configured an OpenAI key (the app's default provider).
    sessionStorage.setItem('ila_apikey_openai', wrap('sk-openai-key'))
})

describe('WorkflowRunner: cross-provider API key handling', () => {
    it('shows a clear failure (and lets the user retry) when the pinned provider has no key', async () => {
        await runWorkflow()

        // The first (provider-agnostic) step runs with the OpenAI key...
        await waitFor(() => expect(runAgentMock).toHaveBeenCalledTimes(1))
        expect(runAgentMock.mock.calls[0][0]).toMatchObject({ provider: 'openai', apiKey: 'sk-openai-key' })

        // ...and the Anthropic-only step must fail gracefully with a helpful message,
        // NOT crash with `ReferenceError: setStepField is not defined`.
        expect(
            await screen.findByText(/API key for provider "anthropic" is not configured/i)
        ).toBeInTheDocument()

        // The UI must not be left stuck on a permanently disabled "Running..." button.
        expect(await screen.findByRole('button', { name: /^retry$/i })).toBeEnabled()
    })

    it('uses the real key (not the JSON storage wrapper) saved for the pinned provider', async () => {
        sessionStorage.setItem('ila_apikey_anthropic', wrap('sk-ant-real-key'))

        await runWorkflow()

        await waitFor(() => expect(runAgentMock).toHaveBeenCalledTimes(2))
        const secondCall = runAgentMock.mock.calls[1][0]
        expect(secondCall.provider).toBe('anthropic')
        expect(secondCall.apiKey).toBe('sk-ant-real-key')
    })

    it('falls back to the key saved in Settings (global keys) for the pinned provider', async () => {
        sessionStorage.setItem('iloveagents_anthropic_key', wrap('sk-ant-from-settings'))

        await runWorkflow()

        await waitFor(() => expect(runAgentMock).toHaveBeenCalledTimes(2))
        expect(runAgentMock.mock.calls[1][0].apiKey).toBe('sk-ant-from-settings')
    })

    it('does not use an expired saved key', async () => {
        sessionStorage.setItem('ila_apikey_anthropic', wrap('sk-ant-expired', Date.now() - 1000))

        await runWorkflow()

        expect(
            await screen.findByText(/API key for provider "anthropic" is not configured/i)
        ).toBeInTheDocument()
        expect(runAgentMock).toHaveBeenCalledTimes(1) // only the first step ran
    })
})
