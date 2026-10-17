import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  buildWorkflowFilename,
  buildWorkflowMarkdown,
  exportWorkflowAsMarkdown,
} from './exportMarkdown'

describe('buildWorkflowFilename', () => {
  it('formats standard titles into lowercase kebab-case', () => {
    expect(buildWorkflowFilename('Content Marketing Pipeline')).toBe(
      'content-marketing-pipeline-output.md'
    )
  })

  it('strips special characters and trims excess dashes', () => {
    expect(buildWorkflowFilename('Audit & Security: 2026!')).toBe(
      'audit--security-2026-output.md'
    )
  })

  it('falls back to workflow when title is empty or whitespace', () => {
    expect(buildWorkflowFilename('')).toBe('workflow-output.md')
    expect(buildWorkflowFilename('   ')).toBe('workflow-output.md')
  })

  it('falls back to workflow when title is null or undefined', () => {
    expect(buildWorkflowFilename(null)).toBe('workflow-output.md')
    expect(buildWorkflowFilename(undefined)).toBe('workflow-output.md')
  })

  it('falls back to workflow when title has only emojis or symbols', () => {
    expect(buildWorkflowFilename('🚀 ✨ 🤖')).toBe('workflow-output.md')
  })
})

describe('buildWorkflowMarkdown', () => {
  it('generates markdown header with workflow title', () => {
    const md = buildWorkflowMarkdown('Blog Generator', [])
    expect(md).toContain('# Blog Generator — Workflow Output')
    expect(md).toContain('Generated on')
  })

  it('includes only completed steps with non-empty output', () => {
    const steps = [
      { agentName: 'Researcher', status: 'done', output: 'Research notes here.' },
      { agentName: 'Writer', status: 'failed', output: null, error: 'Timeout' },
      { agentName: 'Reviewer', status: 'done', output: 'Final critique here.' },
    ]

    const md = buildWorkflowMarkdown('Content Engine', steps)
    expect(md).toContain('## Step 1 — Researcher\n\nResearch notes here.')
    expect(md).not.toContain('Writer')
    expect(md).toContain('## Step 2 — Reviewer\n\nFinal critique here.')
  })

  it('handles null or undefined steps gracefully', () => {
    expect(() => buildWorkflowMarkdown('Safe Title', null)).not.toThrow()
    expect(() => buildWorkflowMarkdown('Safe Title', undefined)).not.toThrow()
  })
})

describe('exportWorkflowAsMarkdown', () => {
  let createdUrl = null
  let revokedUrls = []
  let clickedElement = null

  beforeEach(() => {
    vi.useFakeTimers()
    revokedUrls = []
    createdUrl = 'blob:http://localhost/mock-blob-uuid'
    globalThis.URL.createObjectURL = vi.fn(() => createdUrl)
    globalThis.URL.revokeObjectURL = vi.fn((url) => revokedUrls.push(url))

    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = {
        tagName: tag.toUpperCase(),
        href: '',
        download: '',
        click: vi.fn(function () {
          clickedElement = this
        }),
      }
      return el
    })
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('triggers download and defers revokeObjectURL with a timeout', () => {
    exportWorkflowAsMarkdown('Demo Workflow', [
      { agentName: 'Step 1', status: 'done', output: 'Success' },
    ])

    expect(globalThis.URL.createObjectURL).toHaveBeenCalled()
    expect(clickedElement).not.toBeNull()
    expect(clickedElement.download).toBe('demo-workflow-output.md')
    expect(clickedElement.click).toHaveBeenCalled()

    // Must NOT be revoked synchronously on the same tick
    expect(revokedUrls).toEqual([])

    // Fast-forward timeout
    vi.advanceTimersByTime(1000)
    expect(revokedUrls).toEqual([createdUrl])
  })
})
