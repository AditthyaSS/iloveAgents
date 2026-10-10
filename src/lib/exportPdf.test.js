import { describe, it, expect } from 'vitest'
import { escapeHtml, buildPdfHtml } from './exportPdf'

describe('exportPdf', () => {
  it('escapes html in content and title', () => {
    expect(escapeHtml('<b>&"')).toBe('&lt;b&gt;&amp;&quot;')
  })

  it('builds a printable document', () => {
    const html = buildPdfHtml('Cover Letter', 'Hello <world>')
    expect(html).toContain('Cover Letter')
    expect(html).toContain('Hello &lt;world&gt;')
    expect(html).toContain('<pre>')
  })

  it('handles empty input', () => {
    const html = buildPdfHtml('', '')
    expect(html).toContain('Agent output')
  })
})
