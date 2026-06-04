/**
 * Groq provider smoke tests.
 *
 * Runs on Node's built-in test runner — no extra dependencies required:
 *   node --test tests/groq-provider.test.js
 *
 * These tests exercise the *real* exported functions (`runAgent`, `streamAgent`,
 * `resolveAgentModel`, `MODELS`, `MODEL_MAP`) through the new Groq code path,
 * stubbing only the network layer (`globalThis.fetch`).
 */
import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'

import { runAgent, streamAgent } from '../src/lib/llmAdapter.js'
import { MODELS, MODEL_MAP, resolveAgentModel } from '../src/lib/resolveAgentModel.js'

const realFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = realFetch })

// ---------------------------------------------------------------------------
// Model registry wiring
// ---------------------------------------------------------------------------

test('MODELS includes a non-empty groq list', () => {
  assert.ok(Array.isArray(MODELS.groq), 'MODELS.groq should be an array')
  assert.ok(MODELS.groq.length > 0, 'MODELS.groq should not be empty')
  for (const m of MODELS.groq) {
    assert.equal(typeof m.value, 'string')
    assert.equal(typeof m.label, 'string')
  }
})

test('groq default model is the first listed and is a current production model', () => {
  assert.equal(MODEL_MAP.groq, 'llama-3.3-70b-versatile')
  assert.equal(MODEL_MAP.groq, MODELS.groq[0].value)
})

test('resolveAgentModel honors a valid groq model and falls back to the groq default', () => {
  const agent = { provider: 'any' }
  // valid selected model is preserved
  assert.equal(
    resolveAgentModel(agent, 'groq', 'llama-3.1-8b-instant'),
    'llama-3.1-8b-instant'
  )
  // invalid/empty selection falls back to the groq default, NOT openai
  assert.equal(resolveAgentModel(agent, 'groq', 'not-a-real-model'), MODEL_MAP.groq)
  assert.equal(resolveAgentModel(agent, 'groq', ''), MODEL_MAP.groq)
})

// ---------------------------------------------------------------------------
// runAgent (one-shot)
// ---------------------------------------------------------------------------

test('runAgent(groq) calls the OpenAI-compatible endpoint with Bearer auth and parses the response', async () => {
  let captured = null
  globalThis.fetch = async (url, opts) => {
    captured = { url, opts }
    return {
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Hello from Groq' }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 12, completion_tokens: 8 },
      }),
    }
  }

  const result = await runAgent({
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    apiKey: 'gsk_test_key',
    systemPrompt: 'You are helpful.',
    userMessage: 'Hi',
  })

  // endpoint + auth
  assert.equal(captured.url, 'https://api.groq.com/openai/v1/chat/completions')
  assert.equal(captured.opts.method, 'POST')
  assert.equal(captured.opts.headers.Authorization, 'Bearer gsk_test_key')
  assert.equal(captured.opts.headers['Content-Type'], 'application/json')

  // OpenAI-shaped request body
  const body = JSON.parse(captured.opts.body)
  assert.equal(body.model, 'llama-3.3-70b-versatile')
  assert.equal(body.messages[0].role, 'system')
  assert.equal(body.messages[0].content, 'You are helpful.')
  assert.equal(body.messages[1].role, 'user')
  assert.equal(body.messages[1].content, 'Hi')

  // parsed response
  assert.equal(result.content, 'Hello from Groq')
  assert.equal(result.tokens, 20)
  assert.equal(typeof result.duration, 'number')
})

test('runAgent(groq) maps a 401 to an invalid_api_key error tagged with provider', async () => {
  globalThis.fetch = async () => ({
    ok: false,
    status: 401,
    json: async () => ({ error: { message: 'Invalid API Key' } }),
  })

  await assert.rejects(
    () =>
      runAgent({
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        apiKey: 'bad',
        systemPrompt: 's',
        userMessage: 'u',
      }),
    (err) => {
      assert.equal(err.type, 'invalid_api_key')
      assert.equal(err.provider, 'groq')
      return true
    }
  )
})

test('runAgent rejects an empty API key before hitting the network', async () => {
  let called = false
  globalThis.fetch = async () => { called = true; return { ok: true, json: async () => ({}) } }
  await assert.rejects(
    () => runAgent({ provider: 'groq', model: 'llama-3.3-70b-versatile', apiKey: '   ', systemPrompt: 's', userMessage: 'u' }),
    /API key/
  )
  assert.equal(called, false, 'fetch must not be called when the key is blank')
})

// ---------------------------------------------------------------------------
// streamAgent (SSE)
// ---------------------------------------------------------------------------

test('streamAgent(groq) parses OpenAI-style SSE chunks and concatenates content', async () => {
  const sse = [
    'data: {"choices":[{"delta":{"content":"Hel"}}]}',
    '',
    'data: {"choices":[{"delta":{"content":"lo"}}]}',
    '',
    'data: {"choices":[{"delta":{"content":"!"},"finish_reason":"stop"}]}',
    '',
    'data: [DONE]',
    '',
  ].join('\n')

  globalThis.fetch = async (url, opts) => {
    // confirm the stream flag is set on the body
    assert.equal(JSON.parse(opts.body).stream, true)
    assert.equal(url, 'https://api.groq.com/openai/v1/chat/completions')
    const bytes = new TextEncoder().encode(sse)
    let sent = false
    return {
      ok: true,
      body: {
        getReader: () => ({
          read: async () =>
            sent ? { done: true, value: undefined } : ((sent = true), { done: false, value: bytes }),
        }),
      },
    }
  }

  const chunks = []
  const result = await streamAgent({
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    apiKey: 'gsk_test_key',
    systemPrompt: 's',
    userMessage: 'u',
    onChunk: (t) => chunks.push(t),
  })

  assert.deepEqual(chunks, ['Hel', 'lo', '!'])
  assert.equal(result.content, 'Hello!')
  assert.equal(typeof result.duration, 'number')
})
