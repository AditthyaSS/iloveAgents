import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportBatchAsCSV, exportBatchAsMarkdown } from './exportBatch.js'

const mockResults = [
  { input: 'Hello world', status: 'done', output: 'Hi there', error: '' },
  { input: 'Bad input', status: 'failed', output: '', error: 'API error' },
  { input: 'Third item', status: 'done', output: 'Third output', error: '' },
]

// Mock browser download APIs
let capturedBlob = null
let capturedFilename = null

beforeEach(() => {
  capturedBlob = null
  capturedFilename = null

  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  globalThis.URL.revokeObjectURL = vi.fn()

  const mockAnchor = { href: '', download: '', click: vi.fn() }
  vi.spyOn(document, 'createElement').mockImplementation((tag) => {
    if (tag === 'a') return mockAnchor
    return document.createElement.wrappedJSObject?.(tag)
  })

  globalThis.Blob = class MockBlob {
    constructor(parts, options) {
      this.content = parts.join('')
      this.type = options?.type || ''
      capturedBlob = this
    }
  }

  const origCreateElement = document.createElement.bind(document)
  vi.spyOn(document, 'createElement').mockImplementation((tag) => {
    if (tag === 'a') {
      const a = { href: '', download: '', click: vi.fn() }
      Object.defineProperty(a, 'download', {
        get: () => capturedFilename,
        set: (v) => { capturedFilename = v },
      })
      return a
    }
    return origCreateElement(tag)
  })
})

describe('exportBatchAsCSV', () => {
  it('generates a file with .csv extension', () => {
    exportBatchAsCSV('My Agent', mockResults)
    expect(capturedFilename).toMatch(/\.csv$/)
  })

  it('slugifies the agent name into the filename', () => {
    exportBatchAsCSV('My Agent Name', mockResults)
    expect(capturedFilename).toContain('my-agent-name')
  })

  it('CSV includes a header row', () => {
    exportBatchAsCSV('Test', mockResults)
    const lines = capturedBlob.content.split('\n')
    expect(lines[0]).toContain('Input')
    expect(lines[0]).toContain('Status')
    expect(lines[0]).toContain('Output')
    expect(lines[0]).toContain('Error')
  })

  it('CSV has the correct number of data rows', () => {
    exportBatchAsCSV('Test', mockResults)
    const lines = capturedBlob.content.split('\n').filter(Boolean)
    expect(lines.length).toBe(mockResults.length + 1) // +1 for header
  })

  it('escapes values containing commas', () => {
    const results = [{ input: 'a,b', status: 'done', output: 'x,y', error: '' }]
    exportBatchAsCSV('Agent', results)
    expect(capturedBlob.content).toContain('"a,b"')
    expect(capturedBlob.content).toContain('"x,y"')
  })

  it('escapes values containing double quotes', () => {
    const results = [{ input: 'say "hello"', status: 'done', output: 'ok', error: '' }]
    exportBatchAsCSV('Agent', results)
    expect(capturedBlob.content).toContain('"say ""hello"""')
  })

  it('uses text/csv MIME type', () => {
    exportBatchAsCSV('Agent', mockResults)
    expect(capturedBlob.type).toBe('text/csv')
  })

  it('handles empty results array', () => {
    expect(() => exportBatchAsCSV('Agent', [])).not.toThrow()
    const lines = capturedBlob.content.split('\n').filter(Boolean)
    expect(lines.length).toBe(1) // header only
  })
})

describe('exportBatchAsMarkdown', () => {
  it('generates a file with .md extension', () => {
    exportBatchAsMarkdown('My Agent', mockResults)
    expect(capturedFilename).toMatch(/\.md$/)
  })

  it('slugifies the agent name into the filename', () => {
    exportBatchAsMarkdown('My Agent Name', mockResults)
    expect(capturedFilename).toContain('my-agent-name')
  })

  it('includes the agent name as H1 heading', () => {
    exportBatchAsMarkdown('My Agent', mockResults)
    expect(capturedBlob.content).toContain('# My Agent')
  })

  it('includes item count in header', () => {
    exportBatchAsMarkdown('Agent', mockResults)
    expect(capturedBlob.content).toContain(`${mockResults.length} items processed`)
  })

  it('includes H2 sections for each result', () => {
    exportBatchAsMarkdown('Agent', mockResults)
    const headings = (capturedBlob.content.match(/^## Item/gm) || [])
    expect(headings.length).toBe(mockResults.length)
  })

  it('marks done items with success indicator', () => {
    exportBatchAsMarkdown('Agent', mockResults)
    expect(capturedBlob.content).toContain('✅ Success')
  })

  it('marks failed items with failure indicator', () => {
    exportBatchAsMarkdown('Agent', mockResults)
    expect(capturedBlob.content).toContain('❌ Failed')
  })

  it('includes the input for each item', () => {
    exportBatchAsMarkdown('Agent', mockResults)
    mockResults.forEach(r => {
      expect(capturedBlob.content).toContain(r.input)
    })
  })

  it('includes the error message for failed items', () => {
    exportBatchAsMarkdown('Agent', mockResults)
    expect(capturedBlob.content).toContain('API error')
  })

  it('uses text/markdown MIME type', () => {
    exportBatchAsMarkdown('Agent', mockResults)
    expect(capturedBlob.type).toBe('text/markdown')
  })

  it('handles empty results array without error', () => {
    expect(() => exportBatchAsMarkdown('Agent', [])).not.toThrow()
  })

  it('uses (empty) placeholder for done item with no output', () => {
    const results = [{ input: 'test', status: 'done', output: '', error: '' }]
    exportBatchAsMarkdown('Agent', results)
    expect(capturedBlob.content).toContain('(empty)')
  })

  it('separates sections with horizontal rules', () => {
    exportBatchAsMarkdown('Agent', mockResults)
    expect(capturedBlob.content).toContain('---')
  })
})
