import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useState } from 'react'
import { fetchGeminiModels } from '../lib/llmAdapter'
import ApiKeyBar from './ApiKeyBar'

vi.mock('../lib/llmAdapter', async (importOriginal) => {
  const original = await importOriginal()
  return { ...original, fetchGeminiModels: vi.fn() }
})

const models = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
]

function renderBar(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

function Harness({ initialKey = 'key-1' }) {
  const [apiKey, setApiKey] = useState(initialKey)
  const [model, setModel] = useState('')
  return (
    <>
      <button type="button" onClick={() => setApiKey('key-2')}>
        change-key
      </button>
      <button type="button" onClick={() => setModel('gemini-1.5-pro')}>
        pick-pro
      </button>
      <span data-testid="model">{model}</span>
      <ApiKeyBar
        provider="gemini"
        setProvider={() => {}}
        apiKey={apiKey}
        setApiKey={setApiKey}
        saveForSession={false}
        setSaveForSession={() => {}}
        agentProvider="any"
        model={model}
        setModel={setModel}
      />
    </>
  )
}

describe('ApiKeyBar gemini models', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('defaults an empty selection to the first fetched model', async () => {
    fetchGeminiModels.mockResolvedValueOnce(models)
    renderBar(<Harness />)
    await act(async () => {
      vi.runAllTimers()
    })
    expect(screen.getByTestId('model').textContent).toBe('gemini-2.5-flash')
  })

  it('keeps a valid user selection across refetches', async () => {
    fetchGeminiModels.mockResolvedValue(models)
    renderBar(<Harness />)
    await act(async () => {
      vi.runAllTimers()
    })
    fireEvent.click(screen.getByRole('button', { name: 'pick-pro' }))
    expect(screen.getByTestId('model').textContent).toBe('gemini-1.5-pro')
    fireEvent.click(screen.getByRole('button', { name: 'change-key' }))
    await act(async () => {
      vi.runAllTimers()
    })
    expect(screen.getByTestId('model').textContent).toBe('gemini-1.5-pro')
  })

  it('ignores stale resolutions', async () => {
    let resolveFirst
    let resolveSecond
    fetchGeminiModels
      .mockImplementationOnce(() => new Promise((r) => {
        resolveFirst = r
      }))
      .mockImplementationOnce(() => new Promise((r) => {
        resolveSecond = r
      }))
    renderBar(<Harness />)
    await act(async () => {
      vi.runAllTimers()
    })
    fireEvent.click(screen.getByRole('button', { name: 'change-key' }))
    await act(async () => {
      vi.runAllTimers()
    })
    await act(async () => {
      resolveSecond([{ value: 'new-model', label: 'New' }])
    })
    await act(async () => {
      resolveFirst(models)
    })
    expect(screen.getByTestId('model').textContent).toBe('new-model')
  })
})
