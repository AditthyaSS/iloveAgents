import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportWorkflowAsMarkdown } from './exportMarkdown.js'

const mockSteps = [
  { status: 'done', output: 'First output', agentName: 'Agent A' },
  { status: 'failed', output: null, agentName: 'Agent B' },
  { status: 'done', output: 'Third output', agentName: 'Agent C' },
]

let capturedBlob = null
let capturedFilename = null

beforeEach(() => {
  capturedBlob = null
  capturedFilename = null

  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock')
  globalThis.URL.revokeObjectURL = vi.fn()

  globalThis.Blob = class MockBlob {
    constructor(parts, opts) {
      this.content = parts.join('')
      this.type = opts?.type || ''
      capturedBlob = this
    }
  }

  vi.spyOn(document, 'createElement').mockImplementation((tag) => {
    if (tag === 'a') {
      const a = {
        href: '',
        click: vi.fn(),
        set download(v) { capturedFilename = v },
        get download() { return capturedFilename },
      }
      return a
    }
    return document.createElement.wrappedJSObject?.(tag)
  })
})

describe('exportWorkflowAsMarkdown', () => {
  it('uses text/markdown MIME type', () => {
    exportWorkflowAsMarkdown('My Workflow', mockSteps)
    expect(capturedBlob.type).toBe('text/markdown')
  })

  it('generates a filename ending in -output.md', () => {
    exportWorkflowAsMarkdown('My Workflow', mockSteps)
    expect(capturedFilename).toMatch(/-output\.md$/)
  })

  it('slugifies the workflow title for the filename', () => {
    exportWorkflowAsMarkdown('My Workflow Title', mockSteps)
    expect(capturedFilename).toContain('my-workflow-title')
  })

  it('strips special characters from the filename', () => {
    exportWorkflowAsMarkdown('Café & Résumé!', mockSteps)
    expect(capturedFilename).not.toMatch(/[^a-z0-9-.]/)
  })

  it('includes the workflow title as H1', () => {
    exportWorkflowAsMarkdown('My Workflow', mockSteps)
    expect(capturedBlob.content).toContain('# My Workflow')
  })

  it('includes a "Generated on" date line', () => {
    exportWorkflowAsMarkdown('Workflow', mockSteps)
    expect(capturedBlob.content).toMatch(/Generated on \d+ \w+ \d{4}/)
  })

  it('only includes steps with status "done" and non-empty output', () => {
    exportWorkflowAsMarkdown('Workflow', mockSteps)
    expect(capturedBlob.content).toContain('First output')
    expect(capturedBlob.content).toContain('Third output')
    // failed step with null output should be excluded
    expect(capturedBlob.content).not.toContain('Agent B')
  })

  it('uses agent names as H2 headings with step numbers', () => {
    exportWorkflowAsMarkdown('Workflow', mockSteps)
    expect(capturedBlob.content).toContain('## Step 1 — Agent A')
    expect(capturedBlob.content).toContain('## Step 2 — Agent C')
  })

  it('separates steps with horizontal rules', () => {
    exportWorkflowAsMarkdown('Workflow', mockSteps)
    expect(capturedBlob.content).toContain('---')
  })

  it('handles empty steps array without crashing', () => {
    expect(() => exportWorkflowAsMarkdown('Empty', [])).not.toThrow()
  })

  it('handles steps where all are non-done without crashing', () => {
    const failedSteps = [
      { status: 'failed', output: null, agentName: 'A' },
      { status: 'skipped', output: null, agentName: 'B' },
    ]
    expect(() => exportWorkflowAsMarkdown('Workflow', failedSteps)).not.toThrow()
    // Content should still have the title header
    expect(capturedBlob.content).toContain('# Workflow')
  })

  it('calls URL.revokeObjectURL after triggering download', () => {
    exportWorkflowAsMarkdown('Workflow', mockSteps)
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock')
  })
})
