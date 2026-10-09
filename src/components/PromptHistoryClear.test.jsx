import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PromptHistoryPanel from './PromptHistoryPanel'

const clearHistory = vi.fn()

vi.mock('../lib/usePromptHistory', () => ({
  usePromptHistory: () => ({
    prompts: [
      { id: 'p1', text: 'first prompt', agentName: 'A', favorite: false },
      { id: 'p2', text: 'second prompt', agentName: 'B', favorite: false },
    ],
    favorites: [],
    deletePrompt: vi.fn(),
    clearHistory,
    toggleFavorite: vi.fn(),
    searchPrompts: () => [],
  }),
}))

describe('PromptHistoryPanel clear confirm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it('arms on first click and clears only on confirm', () => {
    render(<PromptHistoryPanel open onClose={() => {}} onUsePrompt={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /clear all/i }))
    expect(clearHistory).not.toHaveBeenCalled()
    expect(screen.getByText(/clear 2 prompts\?/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^confirm$/i }))
    expect(clearHistory).toHaveBeenCalledTimes(1)
  })

  it('cancels without clearing', () => {
    render(<PromptHistoryPanel open onClose={() => {}} onUsePrompt={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /clear all/i }))
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(clearHistory).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument()
  })
})
