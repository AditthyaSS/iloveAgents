import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SafeMarkdown, { sanitizeMarkdownUrl } from './SafeMarkdown'

describe('sanitizeMarkdownUrl', () => {
  it('keeps http, https, mailto, and anchors', () => {
    expect(sanitizeMarkdownUrl('https://example.com/x')).toBe('https://example.com/x')
    expect(sanitizeMarkdownUrl('http://example.com')).toBe('http://example.com')
    expect(sanitizeMarkdownUrl('mailto:a@b.com')).toBe('mailto:a@b.com')
    expect(sanitizeMarkdownUrl('#section')).toBe('#section')
  })

  it('neutralizes dangerous schemes', () => {
    expect(sanitizeMarkdownUrl('javascript:alert(1)')).toBe('#')
    expect(sanitizeMarkdownUrl('JaVaScRiPt:alert(1)')).toBe('#')
    expect(sanitizeMarkdownUrl('data:text/html,<h1>x</h1>')).toBe('#')
    expect(sanitizeMarkdownUrl('vbscript:msgbox(1)')).toBe('#')
    expect(sanitizeMarkdownUrl(null)).toBe('')
  })
})

describe('SafeMarkdown', () => {
  it('does not render javascript: links as clickable targets', () => {
    render(<SafeMarkdown>{'[click me](javascript:alert(1))'}</SafeMarkdown>)
    const link = screen.getByText('click me')
    expect(link.getAttribute('href')).not.toContain('javascript:')
  })

  it('keeps safe links clickable', () => {
    render(<SafeMarkdown>{'[docs](https://example.com/docs)'}</SafeMarkdown>)
    expect(screen.getByText('docs').getAttribute('href')).toBe('https://example.com/docs')
  })

  it('drops raw html blocks', () => {
    const { container } = render(<SafeMarkdown>{'<img src=x onerror=alert(1) />'}</SafeMarkdown>)
    expect(container.querySelector('img')).toBeNull()
  })
})
