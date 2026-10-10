import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TraceViewer from './TraceViewer'

const trace = {
  steps: [
    { stepName: 'Fetch', stepType: 'tool', status: 'done', durationMs: 120, input: 'a', output: 'b' },
    { stepName: 'Parse', stepType: 'llm', status: 'failed', durationMs: 30, error: 'boom' },
  ],
}

describe('TraceViewer semantics', () => {
  it('links accordion buttons to regions and labels the timeline', () => {
    render(<TraceViewer trace={trace} />)
    const btn = screen.getByRole('button', { name: /parse/i })
    const panelId = btn.getAttribute('aria-controls')
    expect(panelId).toBeTruthy()
    expect(document.getElementById(panelId)?.getAttribute('role')).toBe('region')
    expect(screen.getByRole('img', { name: /step durations/i })).toBeInTheDocument()
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'false')
  })
})
