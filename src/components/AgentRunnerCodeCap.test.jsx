import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AgentRunner from './AgentRunner'

vi.mock('./ApiKeyBar', () => ({ default: () => null }))
vi.mock('./ApiKeyInfo', () => ({ default: () => null }))
vi.mock('./OutputRenderer', () => ({ default: () => null }))
vi.mock('./VoiceInput', () => ({ default: () => null }))
vi.mock('./RunRating', () => ({ default: () => null }))
vi.mock('./SuggestedChainPills', () => ({ default: () => null }))
vi.mock('./CostEstimator', () => ({ default: () => null }))
vi.mock('./TokenCounter', () => ({ default: () => null }))
vi.mock('./BatchModeRunner', () => ({ default: () => null }))
vi.mock('./AgentPreviewPanel', () => ({ default: () => null }))
vi.mock('./PromptHistoryPanel', () => ({
  default: ({ onUsePrompt }) => (
    <button data-testid="use-saved-prompt" onClick={() => onUsePrompt('z'.repeat(5000))}>
      use saved
    </button>
  ),
}))
vi.mock('./ScheduleAgentModal', () => ({ default: () => null }))

const agent = {
  id: 'test-agent',
  name: 'Test Agent',
  description: 'An agent used in tests',
  category: 'Test',
  provider: 'any',
  icon: 'Bot',
  outputType: 'text',
  systemPrompt: 'You are a test agent.',
  inputs: [{ id: 'code', label: 'Code', type: 'code', required: true, placeholder: 'paste code here' }],
}

describe('AgentRunner code input cap', () => {
  it('rejects code pastes beyond the shared character limit', () => {
    render(
      <MemoryRouter>
        <AgentRunner agent={agent} />
      </MemoryRouter>
    )
    const box = screen.getByPlaceholderText('paste code here')
    fireEvent.change(box, { target: { value: 'x'.repeat(100) } })
    expect(box.value).toHaveLength(100)
    fireEvent.change(box, { target: { value: 'y'.repeat(5000) } })
    expect(box.value).toHaveLength(100)
    expect(screen.getByText('100 / 4000 characters')).toBeInTheDocument()
  })

  it('caps restored saved prompts at the shared character limit', () => {
    render(
      <MemoryRouter>
        <AgentRunner agent={agent} />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByTestId('use-saved-prompt'))
    expect(screen.getByPlaceholderText('paste code here').value).toHaveLength(4000)
  })
})
