import { describe, it, expect } from 'vitest'
import { stripMarkdown } from './VoiceOutput.jsx'

describe('stripMarkdown', () => {
  it('returns empty string for empty input', () => {
    expect(stripMarkdown('')).toBe('')
    expect(stripMarkdown()).toBe('')
  })

  it('strips fenced code blocks but keeps the code content', () => {
    const md = '```js\nconsole.log("hello")\n```'
    const result = stripMarkdown(md)
    expect(result).not.toContain('```')
    expect(result).toContain('console.log')
  })

  it('strips inline code backticks but keeps the content', () => {
    const result = stripMarkdown('Use `npm install` to install packages.')
    expect(result).not.toContain('`')
    expect(result).toContain('npm install')
  })

  it('strips heading markers', () => {
    expect(stripMarkdown('# Heading 1')).not.toContain('#')
    expect(stripMarkdown('## Heading 2')).not.toContain('#')
    expect(stripMarkdown('### Heading 3')).not.toContain('#')
  })

  it('strips bold markers but keeps text', () => {
    const result = stripMarkdown('This is **bold** text.')
    expect(result).not.toContain('**')
    expect(result).toContain('bold')
  })

  it('strips italic markers but keeps text', () => {
    const result = stripMarkdown('This is *italic* text.')
    expect(result).not.toContain('*')
    expect(result).toContain('italic')
  })

  it('strips underscore emphasis but keeps text', () => {
    const result = stripMarkdown('This is _italic_ text.')
    expect(result).not.toContain('_')
    expect(result).toContain('italic')
  })

  it('strips links, keeping the label text', () => {
    const result = stripMarkdown('Visit [Google](https://google.com) now.')
    expect(result).not.toContain('https://')
    expect(result).not.toContain('[')
    expect(result).toContain('Google')
  })

  it('strips image syntax entirely', () => {
    const result = stripMarkdown('![Alt text](https://example.com/img.png)')
    expect(result).not.toContain('![')
    expect(result).not.toContain('https://')
  })

  it('strips unordered list bullets', () => {
    const result = stripMarkdown('- Item one\n- Item two\n- Item three')
    expect(result).not.toMatch(/^-/m)
    expect(result).toContain('Item one')
  })

  it('strips blockquote markers', () => {
    const result = stripMarkdown('> This is a quote')
    expect(result).not.toContain('>')
    expect(result).toContain('This is a quote')
  })

  it('converts double line breaks to period+space (spoken pause)', () => {
    const result = stripMarkdown('First paragraph.\n\nSecond paragraph.')
    expect(result).toContain('. ')
    expect(result).not.toContain('\n\n')
  })

  it('converts single line breaks to spaces', () => {
    const result = stripMarkdown('Line one\nLine two')
    expect(result).not.toContain('\n')
    expect(result).toContain('Line one')
    expect(result).toContain('Line two')
  })

  it('returns trimmed text', () => {
    const result = stripMarkdown('  Hello world  ')
    expect(result).toBe('Hello world')
  })

  it('handles plain text without markdown without modifying it', () => {
    const plain = 'This is plain text with no markdown.'
    expect(stripMarkdown(plain)).toBe(plain)
  })
})
