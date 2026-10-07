import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AutomationRunDrawer from './AutomationRunDrawer'

vi.mock('./OutputRenderer', () => ({ default: () => null }))

const run = {
  status: 'success',
  automationName: 'Morning Brief',
  agentName: 'Summarizer',
  output: 'hello',
  startedAt: Date.now(),
}

describe('AutomationRunDrawer dialog', () => {
  it('exposes a labelled dialog and closes on Escape', () => {
    const onClose = vi.fn()
    render(<AutomationRunDrawer run={run} isOpen onClose={onClose} />)
    expect(screen.getByRole('dialog', { name: /run execution details/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/copy output/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/download markdown/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/close run details/i)).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
