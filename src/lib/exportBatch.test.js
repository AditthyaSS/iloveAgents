import { describe, it, expect } from 'vitest'
import { csvEscape, exportBatchAsCSV } from './exportBatch'

describe('csvEscape', () => {
  it('leaves plain text alone', () => {
    expect(csvEscape('hello')).toBe('hello')
    expect(csvEscape(42)).toBe('42')
  })

  it('keeps quoting commas, quotes and newlines', () => {
    expect(csvEscape('a,b')).toBe('"a,b"')
    expect(csvEscape('say "hi"')).toBe('"say ""hi"""')
  })

  it('neutralizes formula prefixes', () => {
    expect(csvEscape('=2+2')).toBe("'=2+2")
    expect(csvEscape('+cmd')).toBe("'+cmd")
    expect(csvEscape('-2+3')).toBe("'-2+3")
    expect(csvEscape('@mention')).toBe("'@mention")
  })

  it('still quotes when a neutralized value contains commas', () => {
    expect(csvEscape('=HYPERLINK("x","y")')).toBe(`"'=HYPERLINK(""x"",""y"")"`)
  })
})

describe('exportBatchAsCSV', () => {
  it('writes neutralized rows to the download', () => {
    const clicks = []
    const realCreate = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = realCreate(tag)
      if (tag === 'a') {
        el.click = () => clicks.push(el.download)
      }
      return el
    })
    const urls = []
    vi.stubGlobal('URL', {
      createObjectURL: (blob) => {
        urls.push(blob)
        return 'blob:fake'
      },
      revokeObjectURL: () => {},
    })
    exportBatchAsCSV('Test Agent', [{ input: 'i', status: 'done', output: '=2+2' }])
    expect(clicks).toEqual(['test-agent-batch-results.csv'])
    return urls[0].text().then((csv) => {
      expect(csv).toContain("'=2+2")
    })
  })
})
