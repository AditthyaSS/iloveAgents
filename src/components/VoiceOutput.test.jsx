import { describe, it, expect } from 'vitest'
import { stripMarkdown } from './VoiceOutput'

describe('stripMarkdown', () => {
  it('keeps fenced code content without the fences', () => {
    expect(stripMarkdown('```js\nconst a = 1\n```')).toBe('const a = 1')
  })

  it('strips headings and emphasis markers', () => {
    expect(stripMarkdown('## Title and **bold** text')).toBe('Title and bold text')
  })

  it('reduces links to labels and drops images', () => {
    expect(stripMarkdown('See [docs](https://example.com) end')).toBe('See docs end')
    expect(stripMarkdown('![alt](img.png)')).toBe('!alt')
  })

  it('removes bullets and collapses breaks', () => {
    expect(stripMarkdown('- one\n- two\n\nNext para')).toBe('one two. Next para')
  })

  it('handles empty input', () => {
    expect(stripMarkdown('')).toBe('')
    expect(stripMarkdown(undefined)).toBe('')
  })
})
