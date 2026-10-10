import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RecentRuns from './RecentRuns'

const history = [
  { id: 'r1', agentName: 'Summarizer', provider: 'openai', timestamp: Date.now(), output: 'hello world' },
]

describe('RecentRuns delete', () => {
  it('names the delete control and shows it on focus', () => {
    const onDelete = vi.fn()
    render(
      <MemoryRouter>
        <RecentRuns history={history} onRerun={vi.fn()} onCopy={vi.fn()} onDelete={onDelete} onClearAll={vi.fn()} />
      </MemoryRouter>
    )
    const del = screen.getByRole('button', { name: /delete run: summarizer/i })
    del.focus()
    expect(del).toHaveFocus()
    fireEvent.click(del)
    expect(onDelete).toHaveBeenCalledWith('r1')
  })
})
