import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { runAgent, fetchGeminiModels } from './llmAdapter'

// Mock global fetch
const mockFetch = vi.fn()

describe('llmAdapter', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('runAgent', () => {
    it('throws error for unsupported provider', async () => {
      await expect(
        runAgent({
          provider: 'unknown',
          model: 'test',
          apiKey: 'key',
          systemPrompt: 'sys',
          userMessage: 'user',
        })
      ).rejects.toThrow('Unsupported provider: unknown')
    })

    it('throws error if apiKey is missing', async () => {
      await expect(
        runAgent({
          provider: 'openai',
          model: 'test',
          apiKey: '',
          systemPrompt: 'sys',
          userMessage: 'user',
        })
      ).rejects.toThrow('Please provide an API key to run this agent.')
    })

    it('calls fetch with correct openai parameters and parses response', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Hello OpenAI' } }],
        usage: { prompt_tokens: 10, completion_tokens: 5 },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await runAgent({
        provider: 'openai',
        model: 'gpt-4',
        apiKey: 'sk-123',
        systemPrompt: 'You are a bot',
        userMessage: 'Hi',
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
      const callArgs = mockFetch.mock.calls[0]
      expect(callArgs[0]).toBe('https://api.openai.com/v1/chat/completions')
      expect(callArgs[1].method).toBe('POST')
      expect(callArgs[1].headers.Authorization).toBe('Bearer sk-123')
      
      const body = JSON.parse(callArgs[1].body)
      expect(body.model).toBe('gpt-4')
      expect(body.messages).toHaveLength(2)

      expect(result.content).toBe('Hello OpenAI')
      expect(result.tokens).toBe(15)
      expect(typeof result.duration).toBe('number')
    })
  })

  describe('fetchGeminiModels', () => {
    it('fetches and filters models correctly', async () => {
      const mockResponse = {
        models: [
          { name: 'models/gemini-1.5-flash', displayName: 'Flash', supportedGenerationMethods: ['generateContent'] },
          { name: 'models/gemini-pro', displayName: 'Pro', supportedGenerationMethods: ['generateContent'] },
          { name: 'models/gemini-vision', displayName: 'Vision', supportedGenerationMethods: [] }, // Should be filtered out
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const models = await fetchGeminiModels('test-key')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://generativelanguage.googleapis.com/v1beta/models?key=test-key'
      )
      
      expect(models).toHaveLength(2)
      expect(models[0]).toEqual({ value: 'gemini-1.5-flash', label: 'Flash' })
      expect(models[1]).toEqual({ value: 'gemini-pro', label: 'Pro' })
    })
  })
})
