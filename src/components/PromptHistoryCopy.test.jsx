import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PromptHistoryPanel from './PromptHistoryPanel'

vi.mock('../lib/usePromptHistory', () => ({
  usePromptHistory: () => ({
    prompts: [{ id: 'p1', text: 'hello prompt', agentName: 'A', favorite: false, createdAt: Date.now() }],
    favorites: [],
    deletePrompt: vi.fn(),
    clearHistory: vi.fn(),
    toggleFavorite: vi.fn(),
    searchPrompts: () => [],
  }),
}))

describe('PromptHistoryPanel copy fallback', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('copies through the textarea fallback without throwing', async () => {
    Object.assign(navigator, { clipboard: undefined })
    document.execCommand = vi.fn().mockReturnValue(true)
    render(<PromptHistoryPanel open onClose={() => {}} onUsePrompt={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy to clipboard' }))
    await waitFor(() => expect(document.execCommand).toHaveBeenCalledWith('copy'))
  })
})
