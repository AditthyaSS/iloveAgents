/**
 * LLM Adapter — unified interface for calling OpenAI, Anthropic, and Gemini APIs
 * directly from the browser. No backend required.
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
    parseResponse: (data) => ({
      content: data.choices?.[0]?.message?.content || '',
      tokens:
        (data.usage?.prompt_tokens || 0) +
        (data.usage?.completion_tokens || 0),
    }),
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
    parseResponse: (data) => ({
      content: data.content?.[0]?.text || '',
      tokens:
        (data.usage?.input_tokens || 0) +
        (data.usage?.output_tokens || 0),
    }),
  },

  gemini: {
    url: (model, apiKey) =>
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
    parseResponse: (data) => ({
      content:
        data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      tokens:
        (data.usageMetadata?.promptTokenCount || 0) +
        (data.usageMetadata?.candidatesTokenCount || 0),
    }),
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
 * Run an agent against the specified LLM provider.
 *
 * @param {Object} params
 * @param {'openai'|'anthropic'|'gemini'} params.provider
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
