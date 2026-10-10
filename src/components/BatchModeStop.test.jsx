import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BatchModeRunner from './BatchModeRunner'

vi.mock('../lib/batchRunner', async (importOriginal) => {
  const original = await importOriginal()
  return {
    ...original,
    runBatch: vi.fn(async ({ items, onItemUpdate }) => {
      onItemUpdate(0, { status: 'running' })
      await new Promise(() => {})
    }),
  }
})

const agent = {
  id: 'test-agent',
  name: 'Test Agent',
  inputs: [{ id: 'q', label: 'Question', type: 'textarea', required: true }],
  systemPrompt: 'Answer.',
}

describe('BatchModeRunner stop', () => {
  it('settles in flight rows as stopped instead of leaving them running', async () => {
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
    const paste = screen.getByPlaceholderText(/Item 1/)
    await user.type(paste, 'first item\nsecond item')
    await waitFor(() => expect(screen.getByText('2 items detected')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /run batch/i }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /^stop$/i })).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: /^stop$/i }))
    const stopped = await screen.findAllByText('Stopped by user.')
    expect(stopped.length).toBe(2)
  })
})
