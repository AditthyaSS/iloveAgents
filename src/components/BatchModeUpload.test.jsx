import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import BatchModeRunner from './BatchModeRunner'

vi.mock('../lib/batchRunner', async (importOriginal) => {
  const original = await importOriginal()
  return { ...original, runBatch: vi.fn() }
})

const agent = {
  id: 'test-agent',
  name: 'Test Agent',
  inputs: [{ id: 'q', label: 'Question', type: 'textarea', required: true }],
  systemPrompt: 'Answer.',
}

function setup() {
  const { container } = render(
    <BatchModeRunner
      agent={agent}
      provider="openai"
      apiKey="sk-test"
      selectedModel="gpt-4o-mini"
      systemPrompt="Answer."
    />
  )
  return container.querySelector('input[type="file"]')
}

describe('BatchModeRunner file upload', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('accepts the same file twice in a row', async () => {
    const input = setup()
    const file = new File(['one\ntwo'], 'items.txt', { type: 'text/plain' })
    fireEvent.change(input, { target: { files: [file] } })
    await waitFor(() => expect(screen.getByText('2 items detected')).toBeInTheDocument())
    expect(input.value).toBe('')
    fireEvent.change(input, { target: { files: [file] } })
    await waitFor(() => expect(screen.getByText('2 items detected')).toBeInTheDocument())
  })

  it('reports read failures with the file name', async () => {
    class FailingReader {
      readAsText() {
        setTimeout(() => this.onerror && this.onerror(new Error('denied')), 0)
      }
    }
    vi.stubGlobal('FileReader', FailingReader)
    const input = setup()
    fireEvent.change(input, {
      target: { files: [new File(['x'], 'broken.txt', { type: 'text/plain' })] },
    })
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not read broken.txt')
    vi.unstubAllGlobals()
  })

  it('rejects files over 5 MB before reading', async () => {
    const big = new File(['x'.repeat(1024)], 'huge.txt', { type: 'text/plain' })
    Object.defineProperty(big, 'size', { value: 6 * 1024 * 1024 })
    const input = setup()
    fireEvent.change(input, { target: { files: [big] } })
    expect(await screen.findByRole('alert')).toHaveTextContent('larger than the 5 MB upload limit')
  })
})
