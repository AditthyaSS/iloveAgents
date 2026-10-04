import { describe, it, expect, vi } from 'vitest'
import { extractSuiteJson, generateCustomSuite } from './customSuiteGenerator'
import { streamAgent } from './llmAdapter'

vi.mock('./llmAdapter', () => ({
  streamAgent: vi.fn(),
}))

vi.mock('./useAnalytics', () => ({
  recordAnalyticsRun: vi.fn(),
}))

vi.mock('../suites/suitesData', () => ({
  suites: [],
}))

const payload = { title: 'T', description: 'D', agents: [] }

describe('extractSuiteJson', () => {
  it('parses clean json', () => {
    expect(extractSuiteJson(JSON.stringify(payload))).toEqual(payload)
  })

  it('extracts fenced json with chatter around it', () => {
    const text = `Here is your suite:\n\`\`\`json\n${JSON.stringify(payload)}\n\`\`\`\nEnjoy!`
    expect(extractSuiteJson(text)).toEqual(payload)
  })

  it('extracts bare json with surrounding prose', () => {
    expect(extractSuiteJson(`Sure:\n${JSON.stringify(payload)}\nBye`)).toEqual(payload)
  })

  it('throws a readable error when nothing parses', () => {
    expect(() => extractSuiteJson('no json here')).toThrow(/did not contain valid suite JSON/)
    expect(() => extractSuiteJson('')).toThrow(/empty response/)
  })
})

describe('generateCustomSuite', () => {
  it('requests a valid openrouter model', async () => {
    streamAgent.mockResolvedValueOnce({ content: JSON.stringify(payload), duration: 10 })
    await generateCustomSuite('goal', 'key', 'openrouter')
    expect(streamAgent).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'openrouter', model: 'openai/gpt-4o-mini' })
    )
  })

  it('survives chatter around the response', async () => {
    streamAgent.mockResolvedValueOnce({
      content: `Here you go:\n\`\`\`json\n${JSON.stringify(payload)}\n\`\`\``,
      duration: 10,
    })
    await expect(generateCustomSuite('goal', 'key', 'openai')).resolves.toEqual(payload)
  })
})
