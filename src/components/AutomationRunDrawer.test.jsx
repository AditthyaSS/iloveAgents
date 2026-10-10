import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AutomationRunDrawer from './AutomationRunDrawer'

const run = {
  automationName: 'Daily SEO',
  status: 'success',
  output: 'Report body',
  startedAt: new Date().toISOString(),
}

describe('AutomationRunDrawer resources', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('copies through the textarea fallback without throwing', async () => {
    Object.assign(navigator, { clipboard: undefined })
    document.execCommand = vi.fn().mockReturnValue(true)
    render(<AutomationRunDrawer run={run} isOpen onClose={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy Output' }))
    await waitFor(() => expect(document.execCommand).toHaveBeenCalledWith('copy'))
  })

  it('revokes the download url after starting the download', () => {
    const revoke = vi.fn()
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:fake', revokeObjectURL: revoke })
    vi.useFakeTimers()
    render(<AutomationRunDrawer run={run} isOpen onClose={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Download Markdown' }))
    expect(revoke).not.toHaveBeenCalled()
    vi.runAllTimers()
    expect(revoke).toHaveBeenCalledWith('blob:fake')
    vi.useRealTimers()
  })
})
