/**
 * LLM Adapter — unified interface for calling OpenAI, Anthropic, Gemini, and Groq APIs
 * directly from the browser. No backend required.
 *
 * Supports both one-shot (`runAgent`) and streaming (`streamAgent`) modes.
 */

const PROVIDER_CONFIGS = {
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    }),
    buildBody: (model, systemPrompt, userMessage) => ({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 4096,
    }),
    buildStreamBody: (model, systemPrompt, userMessage) => ({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 4096,
      stream: true,
    }),
    parseResponse: (data) => ({
      content: data.choices?.[0]?.message?.content || '',
      tokens:
        (data.usage?.prompt_tokens || 0) +
        (data.usage?.completion_tokens || 0),
    }),
    /**
     * Parse an SSE line from OpenAI streaming.
     * Returns { content, done } or null if the line should be skipped.
     */
    parseStreamChunk: (line) => {
      if (line === 'data: [DONE]') return { content: '', done: true }
      if (!line.startsWith('data: ')) return null
      try {
        const json = JSON.parse(line.slice(6))
        const delta = json.choices?.[0]?.delta?.content || ''
        const finished = json.choices?.[0]?.finish_reason === 'stop'
        return { content: delta, done: finished }
      } catch {
        return null
      }
    },
  },

  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    }),
    buildBody: (model, systemPrompt, userMessage) => ({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 4096,
    }),
    buildStreamBody: (model, systemPrompt, userMessage) => ({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 4096,
      stream: true,
    }),
    parseResponse: (data) => ({
      content: data.choices?.[0]?.message?.content || '',
      tokens:
        (data.usage?.prompt_tokens || 0) +
        (data.usage?.completion_tokens || 0),
    }),
    parseStreamChunk: (line) => {
      if (line === 'data: [DONE]') return { content: '', done: true }
      if (!line.startsWith('data: ')) return null
      try {
        const json = JSON.parse(line.slice(6))
        const delta = json.choices?.[0]?.delta?.content || ''
        const finished = json.choices?.[0]?.finish_reason === 'stop'
        return { content: delta, done: finished }
      } catch {
        return null
      }
    },
  },

  openrouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://iloveagents.ai',
      'X-Title': 'ILoveAgents',
    }),
    buildBody: (model, systemPrompt, userMessage) => ({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 4096,
    }),
    buildStreamBody: (model, systemPrompt, userMessage) => ({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 4096,
      stream: true,
    }),
    parseResponse: (data) => ({
      content: data.choices?.[0]?.message?.content || '',
      tokens:
        (data.usage?.prompt_tokens || 0) +
        (data.usage?.completion_tokens || 0),
    }),
    parseStreamChunk: (line) => {
      if (line === 'data: [DONE]') return { content: '', done: true }
      if (!line.startsWith('data: ')) return null
      try {
        const json = JSON.parse(line.slice(6))
        const delta = json.choices?.[0]?.delta?.content || ''
        const finished = json.choices?.[0]?.finish_reason === 'stop'
        return { content: delta, done: finished }
      } catch {
        return null
      }
    },
  },

  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    }),
    buildBody: (model, systemPrompt, userMessage) => ({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
    buildStreamBody: (model, systemPrompt, userMessage) => ({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      stream: true,
    }),
    parseResponse: (data) => ({
      content: data.content?.[0]?.text || '',
      tokens:
        (data.usage?.input_tokens || 0) +
        (data.usage?.output_tokens || 0),
    }),
    parseStreamChunk: (line) => {
      if (!line.startsWith('data: ')) return null
      try {
        const json = JSON.parse(line.slice(6))
        if (json.type === 'content_block_delta') {
          return { content: json.delta?.text || '', done: false }
        }
        if (json.type === 'message_stop') {
          return { content: '', done: true }
        }
        // message_start, content_block_start, etc. — skip
        return null
      } catch {
        return null
      }
    },
  },

  gemini: {
    url: (model, apiKey) =>
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    streamUrl: (model, apiKey) =>
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
    buildHeaders: () => ({
      'Content-Type': 'application/json',
    }),
    buildBody: (_model, systemPrompt, userMessage) => ({
      contents: [
        {
          parts: [{ text: systemPrompt + '\n\n' + userMessage }],
        },
      ],
    }),
    buildStreamBody: (_model, systemPrompt, userMessage) => ({
      contents: [
        {
          parts: [{ text: systemPrompt + '\n\n' + userMessage }],
        },
      ],
    }),
    parseResponse: (data) => ({
      content:
        data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      tokens:
        (data.usageMetadata?.promptTokenCount || 0) +
        (data.usageMetadata?.candidatesTokenCount || 0),
    }),
    parseStreamChunk: (line) => {
      if (!line.startsWith('data: ')) return null
      try {
        const json = JSON.parse(line.slice(6))
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text || ''
        const finished = json.candidates?.[0]?.finishReason === 'STOP'
        return { content: text, done: finished }
      } catch {
        return null
      }
    },
  },
}

const ERROR_MESSAGES = {
  401: 'Invalid API key. Please check your key and try again.',
  403: 'Access forbidden. Your API key may not have the required permissions.',
  429: 'Rate limit hit. Wait a moment and try again.',
  500: 'The API server encountered an error. Try again shortly.',
  502: 'Bad gateway — the API is temporarily unavailable.',
  503: 'The API service is temporarily unavailable. Try again in a minute.',
}

/**
 * Handle non-OK HTTP responses consistently.
 */
async function handleErrorResponse(response) {
  const friendlyMessage =
    ERROR_MESSAGES[response.status] ||
    `API returned status ${response.status}. Please check your configuration.`

  let detail = ''
  try {
    const errBody = await response.json()
    detail = errBody?.error?.message || JSON.stringify(errBody)
  } catch {
    // Could not parse error body
  }

  throw new Error(
    detail ? `${friendlyMessage}\n\nDetails: ${detail}` : friendlyMessage
  )
}

/**
 * Run an agent against the specified LLM provider (one-shot, non-streaming).
 *
 * @param {Object} params
 * @param {'openai'|'anthropic'|'gemini'|'groq'|'openrouter'} params.provider
 * @param {string} params.model
 * @param {string} params.apiKey
 * @param {string} params.systemPrompt
 * @param {string} params.userMessage
 * @returns {Promise<{content: string, tokens: number, duration: number}>}
 */
export async function runAgent({ provider, model, apiKey, systemPrompt, userMessage }) {
  const config = PROVIDER_CONFIGS[provider]

  if (!config) {
    throw new Error(`Unsupported provider: ${provider}`)
  }

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Please provide an API key to run this agent.')
  }

  const url =
    typeof config.url === 'function'
      ? config.url(model, apiKey)
      : config.url

  const headers = config.buildHeaders(apiKey)
  const body = config.buildBody(model, systemPrompt, userMessage)

  const startTime = performance.now()

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      await handleErrorResponse(response)
    }

    const data = await response.json()
    const parsed = config.parseResponse(data)
    const duration = Math.round(performance.now() - startTime)

    return {
      content: parsed.content,
      tokens: parsed.tokens,
      duration,
    }
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error(
        "Couldn't reach the API. Check your internet connection and try again."
      )
    }
    throw error
  }
}

/**
 * Run an agent with streaming output. Calls `onChunk` with each piece of text
 * as it arrives so the UI can render progressively.
 *
 * @param {Object} params
 * @param {'openai'|'anthropic'|'gemini'|'groq'|'openrouter'} params.provider
 * @param {string} params.model
 * @param {string} params.apiKey
 * @param {string} params.systemPrompt
 * @param {string} params.userMessage
 * @param {(text: string) => void} params.onChunk — called with each token/chunk
 * @param {AbortSignal} [params.signal] — optional AbortSignal to cancel streaming
 * @returns {Promise<{content: string, duration: number}>}
 */
export async function streamAgent({ provider, model, apiKey, systemPrompt, userMessage, onChunk, signal }) {
  const config = PROVIDER_CONFIGS[provider]

  if (!config) {
    throw new Error(`Unsupported provider: ${provider}`)
  }

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Please provide an API key to run this agent.')
  }

  // Determine the streaming URL
  let url
  if (provider === 'gemini') {
    url = config.streamUrl(model, apiKey)
  } else {
    url = typeof config.url === 'function' ? config.url(model, apiKey) : config.url
  }

  const headers = config.buildHeaders(apiKey)
  const body = config.buildStreamBody(model, systemPrompt, userMessage)

  const startTime = performance.now()
  let fullContent = ''

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal,
    })

    if (!response.ok) {
      await handleErrorResponse(response)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // Process complete lines from the buffer
      const lines = buffer.split('\n')
      // Keep the last (potentially incomplete) line in the buffer
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue

        const parsed = config.parseStreamChunk(trimmed)
        if (!parsed) continue

        if (parsed.content) {
          fullContent += parsed.content
          onChunk(parsed.content)
        }

        if (parsed.done) break
      }
    }

    // Process any remaining buffer content
    if (buffer.trim()) {
      const parsed = config.parseStreamChunk(buffer.trim())
      if (parsed?.content) {
        fullContent += parsed.content
        onChunk(parsed.content)
      }
    }

    const duration = Math.round(performance.now() - startTime)

    return {
      content: fullContent,
      duration,
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      const duration = Math.round(performance.now() - startTime)
      return { content: fullContent, duration }
    }
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error(
        "Couldn't reach the API. Check your internet connection and try again."
      )
    }
    throw error
  }
}
