import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AutomationRunDrawer from './AutomationRunDrawer'
import { downloadBlob } from '../lib/downloadBlob'

vi.mock('./OutputRenderer', () => ({ default: () => null }))
vi.mock('../lib/downloadBlob', () => ({
  downloadBlob: vi.fn(),
  downloadTextFile: vi.fn(),
}))

function renderDrawer(run) {
  render(<AutomationRunDrawer run={run} isOpen onClose={vi.fn()} />)
  fireEvent.click(screen.getByTitle(/download markdown/i))
}

describe('AutomationRunDrawer download filename', () => {
  it('strips unsafe characters and falls back on bad dates', () => {
    renderDrawer({
      status: 'success',
      automationName: 'a/b:c*d',
      agentName: 'A',
      output: 'x',
      startedAt: 'not-a-date',
    })
    expect(downloadBlob).toHaveBeenCalledWith('x', 'text/markdown', 'a_b_c_d_undated.md')
  })

  it('uses a dated name for valid runs', () => {
    renderDrawer({
      status: 'success',
      automationName: 'Morning Brief',
      agentName: 'A',
      output: 'x',
      startedAt: '2026-01-15T10:00:00.000Z',
    })
    expect(downloadBlob).toHaveBeenCalledWith('x', 'text/markdown', 'Morning_Brief_2026-01-15.md')
  })
})
