import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportWorkflowAsMarkdown } from './exportMarkdown'

beforeEach(() => {
  globalThis.Blob = class {
    constructor(parts) {
      this.parts = parts
    }
  }
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:url')
  globalThis.URL.revokeObjectURL = vi.fn()
  const anchor = { href: '', download: '', click: vi.fn() }
  vi.spyOn(document, 'createElement').mockReturnValue(anchor)
})

describe('exportWorkflowAsMarkdown guards', () => {
  it('handles missing title and steps without throwing', () => {
    expect(() => exportWorkflowAsMarkdown(undefined, undefined)).not.toThrow()
    expect(() => exportWorkflowAsMarkdown('', null)).not.toThrow()
    expect(() => exportWorkflowAsMarkdown('My Workflow!', [])).not.toThrow()
  })

  it('skips malformed steps', () => {
    expect(() =>
      exportWorkflowAsMarkdown('Demo', [null, undefined, { status: 'done' }])
    ).not.toThrow()
  })
})
