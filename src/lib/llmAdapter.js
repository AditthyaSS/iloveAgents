/**
 * LLM Adapter — unified interface for calling OpenAI, Anthropic, and Gemini APIs
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
  401: 'invalid_api_key', // We'll use a key to help downstream logic
  403: 'Access forbidden. Your API key may not have the required permissions.',
  429: 'Rate limit hit. Wait a moment and try again.',
  500: 'The API server encountered an error. Try again shortly.',
  502: 'Bad gateway — the API is temporarily unavailable.',
  503: 'The API service is temporarily unavailable. Try again in a minute.',
};

const PROVIDER_LABELS = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  gemini: 'Gemini',
  openrouter: 'OpenRouter',
}

const VALIDATION_DEFAULT_MESSAGES = {
  invalid_api_key: (label) => `Invalid ${label} API key.`,
  quota_exceeded: (label) => `Quota exceeded or billing issue for ${label}.`,
  network_error: () =>
    "Couldn't reach the API. Check your internet connection and try again.",
  unknown_error: (label) =>
    `Unexpected error from ${label}. Check your configuration.`,
}

// Providers that sometimes return 200 OK with an error in the payload
const VALIDATION_PAYLOAD_ERROR_PROVIDERS = new Set(['openrouter'])

const ANTHROPIC_VALIDATION_MODEL = 'claude-3-5-haiku-20241022'

/**
 * Handle non-OK HTTP responses consistently.
 */
async function handleErrorResponse(response, provider = "unknown") {
  const errorKey = ERROR_MESSAGES[response.status] || null;
  let detail = '';
  try {
    const errBody = await response.json();
    detail = errBody?.error?.message || JSON.stringify(errBody);
  } catch {
    // Could not parse error body
  }

  if (errorKey === 'invalid_api_key') {
    throw {
      type: "invalid_api_key",
      provider,
      detail: detail || 'No additional details',
    };
  }

  const friendlyMessage =
    typeof ERROR_MESSAGES[response.status] === 'string'
      ? ERROR_MESSAGES[response.status]
      : `API returned status ${response.status}. Please check your configuration.`;

  throw new Error(
    detail ? `${friendlyMessage}\n\nDetails: ${detail}` : friendlyMessage
  );
}

function extractErrorMessage(payload) {
  if (!payload) return ''
  if (typeof payload === 'string') return payload
  if (payload.error) {
    if (typeof payload.error === 'string') return payload.error
    if (typeof payload.error.message === 'string') return payload.error.message
    return 'Unknown error'
  }
  if (typeof payload.message === 'string') return payload.message
  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    const firstError = payload.errors[0]
    if (typeof firstError === 'string') return firstError
    if (typeof firstError?.message === 'string') return firstError.message
  }
  return ''
}

function classifyValidationError(status, detail) {
  const normalizedDetail = (detail || '').toLowerCase()
  if (
    status === 401 ||
    status === 403 ||
    normalizedDetail.includes('invalid api key') ||
    normalizedDetail.includes('unauthorized') ||
    normalizedDetail.includes('authentication') ||
    normalizedDetail.includes('api key')
  ) {
    return 'invalid_api_key'
  }
  if (
    status === 402 ||
    status === 429 ||
    normalizedDetail.includes('rate limit') ||
    normalizedDetail.includes('quota') ||
    normalizedDetail.includes('billing')
  ) {
    return 'quota_exceeded'
  }
  return 'unknown_error'
}

function buildValidationMessage(code, provider, detail) {
  const label = PROVIDER_LABELS[provider] || 'Provider'
  if (code === 'network_error') {
    return VALIDATION_DEFAULT_MESSAGES.network_error()
  }
  if (code === 'invalid_api_key') {
    return VALIDATION_DEFAULT_MESSAGES.invalid_api_key(label)
  }
  if (code === 'quota_exceeded') {
    return VALIDATION_DEFAULT_MESSAGES.quota_exceeded(label)
  }
  if (detail) return detail
  return VALIDATION_DEFAULT_MESSAGES.unknown_error(label)
}

async function readJsonSafely(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

async function normalizeValidationResponse(response, provider) {
  if (!response.ok) {
    const payload = await readJsonSafely(response)
    const detail = extractErrorMessage(payload)
    const code = classifyValidationError(response.status, detail)
    return {
      valid: false,
      code,
      message: buildValidationMessage(code, provider, detail),
    }
  }

  if (VALIDATION_PAYLOAD_ERROR_PROVIDERS.has(provider)) {
    const payload = await readJsonSafely(response)
    const detail = extractErrorMessage(payload)
    if (detail) {
      const code = classifyValidationError(response.status, detail)
      return {
        valid: false,
        code,
        message: buildValidationMessage(code, provider, detail),
      }
    }
  }

  return { valid: true }
}
/**
 * Run an agent against the specified LLM provider (one-shot, non-streaming).
 *
 * @param {Object} params
 * @param {'openai'|'anthropic'|'gemini'|'openrouter'} params.provider
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
      await handleErrorResponse(response, provider)
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
 * @param {'openai'|'anthropic'|'gemini'|'openrouter'} params.provider
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

async function validateOpenAIKey(apiKey) {
  const config = PROVIDER_CONFIGS.openai
  const response = await fetch('https://api.openai.com/v1/models', {
    method: 'GET',
    headers: config.buildHeaders(apiKey),
  })
  return normalizeValidationResponse(response, 'openai')
}

async function validateGeminiKey(apiKey) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    { method: 'GET' }
  )
  return normalizeValidationResponse(response, 'gemini')
}

async function validateAnthropicKey(apiKey) {
  const config = PROVIDER_CONFIGS.anthropic
  const response = await fetch('https://api.anthropic.com/v1/models', {
    method: 'GET',
    headers: config.buildHeaders(apiKey),
  })

  const { status } = response
  const normalized = await normalizeValidationResponse(response, 'anthropic')
  if (normalized.valid) return normalized
  if (status === 404 || status === 405) {
    return validateAnthropicWithMessages(apiKey)
  }
  return normalized
}

async function validateAnthropicWithMessages(apiKey) {
  const config = PROVIDER_CONFIGS.anthropic
  const body = {
    model: ANTHROPIC_VALIDATION_MODEL,
    max_tokens: 1,
    system: 'Validation request.',
    messages: [{ role: 'user', content: 'ping' }],
  }

  const response = await fetch(config.url, {
    method: 'POST',
    headers: config.buildHeaders(apiKey),
    body: JSON.stringify(body),
  })

  return normalizeValidationResponse(response, 'anthropic')
}

const providerValidators = {
  openai: validateOpenAIKey,
  anthropic: validateAnthropicKey,
  gemini: validateGeminiKey,
}

/**
 * Validate a provider API key using a lightweight metadata endpoint.
 * Returns a normalized result object for UI use.
 */
export async function validateProviderKey(provider, apiKey) {
  if (!apiKey || apiKey.trim() === '') {
    return {
      valid: false,
      code: 'invalid_api_key',
      message: 'API key is required.',
    }
  }

  const validator = providerValidators[provider]
  if (!validator) {
    return {
      valid: false,
      code: 'unknown_error',
      message: `Unsupported provider: ${provider}`,
    }
  }

  try {
    return await validator(apiKey)
  } catch (error) {
    if (error?.name === 'TypeError' && error?.message === 'Failed to fetch') {
      return {
        valid: false,
        code: 'network_error',
        message: buildValidationMessage('network_error', provider, ''),
      }
    }

    return {
      valid: false,
      code: 'unknown_error',
      message:
        error?.message ||
        buildValidationMessage('unknown_error', provider, ''),
    }
  }
}

/**
 * Fetch supported Gemini models dynamically from the Google API.
 * Returns models that support generateContent (i.e. usable for chat/generation).
 *
 * @param {string} apiKey
 * @returns {Promise<Array<{value: string, label: string}>>}
 */
export async function fetchGeminiModels(apiKey) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  )
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return (data.models || [])
    .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
    .map(m => ({
      value: m.name.replace('models/', ''),
      label: m.displayName || m.name.replace('models/', ''),
    }))
}