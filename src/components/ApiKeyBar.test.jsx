import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ApiKeyBar from './ApiKeyBar'
import { fetchGeminiModels } from '../lib/llmAdapter'

vi.mock('../lib/llmAdapter', () => ({
  fetchGeminiModels: vi.fn(),
}))

const baseProps = {
  provider: 'gemini',
  setProvider: vi.fn(),
  apiKey: 'k1',
  setApiKey: vi.fn(),
  saveForSession: true,
  setSaveForSession: vi.fn(),
  agentProvider: 'any',
  model: 'gemini-1.5-pro',
  setModel: vi.fn(),
}

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

describe('ApiKeyBar gemini fetch', () => {
  it('ignores stale responses and keeps a valid user selection', async () => {
    let resolveFirst
    let resolveSecond
    fetchGeminiModels
      .mockReturnValueOnce(new Promise((r) => { resolveFirst = r }))
      .mockReturnValueOnce(new Promise((r) => { resolveSecond = r }))

    const { rerender } = render(
      <MemoryRouter>
        <ApiKeyBar {...baseProps} />
      </MemoryRouter>
    )
    await act(async () => {
      vi.advanceTimersByTime(400)
    })
    rerender(
      <MemoryRouter>
        <ApiKeyBar {...baseProps} apiKey="k2" />
      </MemoryRouter>
    )
    await act(async () => {
      vi.advanceTimersByTime(400)
    })

    await act(async () => {
      resolveFirst([{ value: 'stale-model', label: 'Stale' }])
    })
    await act(async () => {
      resolveSecond([
        { value: 'gemini-1.5-pro', label: 'Pro' },
        { value: 'gemini-2.5-flash', label: 'Flash' },
      ])
    })

    expect(baseProps.setModel).not.toHaveBeenCalledWith('stale-model')
    expect(baseProps.setModel).not.toHaveBeenCalled()
  })

  it('defaults to the first model when the selection is gone', async () => {
    fetchGeminiModels.mockResolvedValue([{ value: 'gemini-2.5-flash', label: 'Flash' }])
    render(
      <MemoryRouter>
        <ApiKeyBar {...baseProps} model="retired-model" />
      </MemoryRouter>
    )
    await act(async () => {
      vi.advanceTimersByTime(400)
    })
    await act(async () => {})
    expect(baseProps.setModel).toHaveBeenCalledWith('gemini-2.5-flash')
  })
})
