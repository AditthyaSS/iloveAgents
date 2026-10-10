import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AgentPreviewPanel from './AgentPreviewPanel'

const agent = {
  id: 'a1',
  name: 'Test Agent',
  description: 'Does things.',
  category: 'Engineering',
  provider: 'openai',
  icon: 'Bot',
  outputType: 'markdown',
  systemPrompt: 'Be helpful.',
  inputs: [{ id: 'q', label: 'Question', type: 'textarea', required: false }],
}

describe('AgentPreviewPanel toggle', () => {
  it('reflects open state through aria-expanded', () => {
    render(<AgentPreviewPanel agent={agent} />)
    const toggle = screen.getByRole('button', { name: /system prompt/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
})
