// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── In-memory stand-in for the slice of Supabase the cron uses ───────────────
// Every query is executed synchronously when awaited, so a single UPDATE ...
// WHERE is atomic exactly like it is in Postgres. That is what lets these
// tests exercise the claim/lock logic honestly.
let db

function makeDb() {
  const tables = { automations: [], user_secrets: [], automation_runs: [] }

  function from(table) {
    const q = { mode: 'select', filters: [], patch: null, row: null, wantRows: false, single: false, limit: null, order: null }

    const exec = () => {
      const rows = tables[table]
      if (q.mode === 'insert') {
        rows.push({ ...q.row })
        return { data: null, error: null }
      }
      let matched = rows.filter((r) => q.filters.every((f) => f(r)))
      if (q.mode === 'update') {
        matched.forEach((r) => Object.assign(r, q.patch))
        return { data: q.wantRows ? matched.map((r) => ({ ...r })) : null, error: null }
      }
      if (q.order) {
        const { c, ascending } = q.order
        matched = [...matched].sort((a, b) => (Date.parse(a[c]) - Date.parse(b[c])) * (ascending ? 1 : -1))
      }
      if (q.limit != null) matched = matched.slice(0, q.limit)
      matched = matched.map((r) => ({ ...r }))
      if (q.single) {
        if (matched.length === 1) return { data: matched[0], error: null }
        return q.single === 'maybe'
          ? { data: matched[0] ?? null, error: null }
          : { data: null, error: { code: 'PGRST116', message: 'no rows' } }
      }
      return { data: matched, error: null }
    }

    const b = {
      select() { if (q.mode !== 'select') q.wantRows = true; return b },
      insert(row) { q.mode = 'insert'; q.row = row; return b },
      update(patch) { q.mode = 'update'; q.patch = patch; return b },
      eq(c, v) { q.filters.push((r) => r[c] === v); return b },
      lte(c, v) { q.filters.push((r) => Date.parse(r[c]) <= Date.parse(v)); return b },
      order(c, { ascending = true } = {}) { q.order = { c, ascending }; return b },
      limit(n) { q.limit = n; return b },
      single() { q.single = true; return b },
      maybeSingle() { q.single = 'maybe'; return b },
      then(res, rej) {
        const result = exec() // executes (atomically) at call time...
        const latency = q.mode === 'select' && table === 'automations' ? db.selectLatencyMs || 0 : 0
        // ...but the response only reaches the caller after the "network" delay.
        return (latency ? sleep(latency) : Promise.resolve()).then(() => result).then(res, rej)
      },
    }
    return b
  }

  return { tables, client: { from } }
}

vi.mock('@supabase/supabase-js', () => ({ createClient: () => db.client }))

// The REAL client-side encryption, exactly as the browser writes vault keys.
// (The client code reads `window.crypto`; alias it so Node takes the AES-GCM
// path instead of silently falling back to base64.)
globalThis.window ??= globalThis
import { encryptSecret } from './automationsService'
import handler from '../../api/cron/tick.js'

// ── fake provider / Resend network ───────────────────────────────────────────
const REAL_KEY = 'sk-real-key-1234567890'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const reply = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body })

let calls
let routes

function installFetch() {
  calls = []
  routes = {
    openai: async (init) =>
      init.headers.Authorization === `Bearer ${REAL_KEY}`
        ? reply(200, { choices: [{ message: { content: 'LLM OUT' } }], usage: {} })
        : reply(401, { error: { message: 'Incorrect API key provided' } }),
    anthropic: async (init) =>
      init.headers['x-api-key'] === REAL_KEY
        ? reply(200, { content: [{ type: 'text', text: 'ANT OUT' }], usage: {} })
        : reply(401, { error: { message: 'invalid x-api-key' } }),
    resend: async () => reply(200, { id: 'email_1' }),
  }
  globalThis.fetch = vi.fn((url, init = {}) => {
    const host = new URL(url).hostname
    const name = host.includes('openai') ? 'openai' : host.includes('anthropic') ? 'anthropic' : host.includes('resend') ? 'resend' : 'other'
    calls.push({ name, url, init, body: init.body ? JSON.parse(init.body) : null })
    return routes[name](init)
  })
}

const callsTo = (name) => calls.filter((c) => c.name === name)
const runs = () => db.tables.automation_runs
const row = () => db.tables.automations[0]

function seed({ id = 'auto_1', provider = 'openai', model = 'gpt-4o-mini', schedule = 'daily', encrypted, withSecret = true, email = true, enabled = true, dueInMs = -60_000 } = {}) {
  db.tables.automations.push({
    id,
    name: 'Daily SEO',
    agent_name: 'SEO Agent',
    provider,
    model,
    schedule,
    enabled,
    inputs: { topic: 'ai agents' },
    system_prompt: 'SYS PROMPT',
    email_notification: email,
    notification_email: 'user@example.com',
    next_run_at: new Date(Date.now() + dueInMs).toISOString(),
    last_run_at: null,
  })
  if (withSecret) db.tables.user_secrets.push({ automation_id: id, encrypted_key: encrypted ?? btoa(REAL_KEY) })
}

async function tick() {
  const res = { code: null, body: null, status(c) { this.code = c; return this }, json(b) { this.body = b; return this } }
  await handler({ headers: {} }, res)
  return res
}

beforeEach(() => {
  db = makeDb()
  installFetch()
  process.env.SUPABASE_URL = 'https://example.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role'
  process.env.RESEND_API_KEY = 're_test'
  delete process.env.CRON_SECRET
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => vi.restoreAllMocks())

describe('cron tick: guards (existing behaviour that must keep working)', () => {
  it('runs a due automation with a legacy base64 vault key and records it', async () => {
    seed()
    const res = await tick()
    expect(res.code).toBe(200)
    expect(callsTo('openai')).toHaveLength(1)
    expect(runs()).toHaveLength(1)
    expect(runs()[0]).toMatchObject({ status: 'success', output: 'LLM OUT', automation_id: 'auto_1' })
  })

  it("forwards the automation's model and system prompt to the provider", async () => {
    seed({ model: 'gpt-4o' })
    await tick()
    const body = callsTo('openai')[0].body
    expect(body.model).toBe('gpt-4o')
    expect(body.messages[0]).toEqual({ role: 'system', content: 'SYS PROMPT' })
  })

  it('ignores disabled and not-yet-due automations', async () => {
    seed({ id: 'a', enabled: false })
    seed({ id: 'b', dueInMs: 3_600_000 })
    await tick()
    expect(callsTo('openai')).toHaveLength(0)
    expect(runs()).toHaveLength(0)
  })

  it.each([
    ['hourly', 3_600_000],
    ['daily', 86_400_000],
    ['weekly', 604_800_000],
  ])('schedules the next %s run one interval ahead', async (schedule, ms) => {
    seed({ schedule })
    const before = Date.now()
    await tick()
    const next = Date.parse(row().next_run_at)
    expect(next).toBeGreaterThanOrEqual(before + ms - 1000)
    expect(next).toBeLessThanOrEqual(Date.now() + ms + 1000)
  })

  it('a failing automation still advances next_run_at (no hot loop on persistent failure)', async () => {
    seed({ withSecret: false })
    await tick()
    expect(runs()[0].status).toBe('failed')
    expect(Date.parse(row().next_run_at)).toBeGreaterThan(Date.now())
    await tick()
    expect(runs()).toHaveLength(1) // not picked up again
  })
})

describe('cron tick: execution correctness', () => {
  it('decrypts a vault key written by the client (AES-GCM) before calling the provider', async () => {
    const encrypted = await encryptSecret(REAL_KEY)
    // Make sure the AES path really ran; a base64 fallback would hide the bug.
    expect(atob(encrypted)).not.toBe(REAL_KEY)
    seed({ encrypted })

    await tick()

    expect(callsTo('openai')[0].init.headers.Authorization).toBe(`Bearer ${REAL_KEY}`)
    expect(runs()[0]).toMatchObject({ status: 'success', output: 'LLM OUT' })
  })

  it('records provider HTTP errors as failed runs instead of "success"', async () => {
    routes.openai = async () => reply(429, { error: { message: 'You exceeded your current quota' } })
    seed()

    const res = await tick()

    expect(runs()[0].status).toBe('failed')
    expect(runs()[0].error).toMatch(/quota/i)
    expect(res.body.results[0].status).toBe('failed')
    const subjects = callsTo('resend').map((c) => c.body.subject)
    subjects.forEach((s) => expect(s).not.toMatch(/Completed/))
  })

  it('actually calls non-OpenAI providers instead of faking a success', async () => {
    seed({ provider: 'anthropic', model: 'claude-sonnet-4-5' })

    await tick()

    expect(callsTo('anthropic')).toHaveLength(1)
    expect(callsTo('anthropic')[0].init.headers['x-api-key']).toBe(REAL_KEY)
    expect(runs()[0]).toMatchObject({ status: 'success', output: 'ANT OUT' })
  })

  it('HTML-escapes model output in the notification email', async () => {
    routes.openai = async () => reply(200, { choices: [{ message: { content: '<img src=x onerror=alert(1)>' } }] })
    seed()

    await tick()

    const html = callsTo('resend')[0].body.html
    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;img')
  })

  it('a failing notification email does not turn a successful run into a failed one', async () => {
    routes.resend = async () => { throw new TypeError('network down') }
    seed()

    await tick()

    expect(runs()[0].status).toBe('success')
    expect(runs()[0].output).toBe('LLM OUT')
  })
})

describe('cron tick: concurrency & timeouts', () => {
  it('overlapping invocations execute a due automation exactly once', async () => {
    routes.openai = async () => {
      await sleep(30) // a real LLM call takes far longer than the claim window
      return reply(200, { choices: [{ message: { content: 'LLM OUT' } }] })
    }
    db.selectLatencyMs = 10 // both invocations read the due row before either can claim it
    seed()

    // Separate serverless invocations never start in the same microtask; start the 2nd shortly after the 1st.
    const first = tick()
    await sleep(2)
    const second = tick()
    await Promise.all([first, second])

    expect(callsTo('openai')).toHaveLength(1)
    expect(runs()).toHaveLength(1)
    expect(callsTo('resend')).toHaveLength(1)
  })

  it('claims the automation before running it, so a killed invocation is never replayed forever', async () => {
    routes.openai = () => new Promise(() => {}) // the provider call outlives the function
    seed()

    // The platform kills the function at its timeout; the pending handler is abandoned.
    await Promise.race([tick(), sleep(60)])

    expect(Date.parse(row().next_run_at)).toBeGreaterThan(Date.now())

    // The next scheduled tick must not replay (and re-bill) the same run.
    routes.openai = async () => reply(200, { choices: [{ message: { content: 'LLM OUT' } }] })
    await tick()
    expect(callsTo('openai')).toHaveLength(1)
  })
})
