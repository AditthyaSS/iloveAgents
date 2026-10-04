import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

describe('BatchModeRunner batch limit', () => {
  it('explains why runs stay disabled past 25 items', async () => {
    const user = userEvent.setup()
    render(
      <BatchModeRunner
        agent={agent}
        provider="openai"
        apiKey="sk-test"
        selectedModel="gpt-4o-mini"
        systemPrompt="Answer."
      />
    )
    const lines = Array.from({ length: 26 }, (_, i) => `item ${i + 1}`).join('\n')
    await user.type(screen.getByPlaceholderText(/Item 1/), lines)
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Batch runs support up to 25 items. Remove 1 to continue.'
    )
    expect(screen.getByRole('button', { name: /run batch/i })).toBeDisabled()
  })

  it('stays quiet within the limit', async () => {
    const user = userEvent.setup()
    render(
      <BatchModeRunner
        agent={agent}
        provider="openai"
        apiKey="sk-test"
        selectedModel="gpt-4o-mini"
        systemPrompt="Answer."
      />
    )
    await user.type(screen.getByPlaceholderText(/Item 1/), 'one\ntwo')
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
