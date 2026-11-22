import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// All "tabs" share this fake provider (the module under test is re-imported per
// tab, so the factory must delegate to a shared global).
vi.mock('./llmAdapter', () => ({
  runAgent: (...args) => globalThis.__runAgent(...args),
}))

const RUNS_KEY = 'ila_automation_runs_v2'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function until(cond, timeoutMs = 2000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (await cond()) return true
    await sleep(5)
  }
  return false
}

// ── Web Locks API stand-in (same semantics as navigator.locks) ───────────────
// Shared by every simulated tab, like the real per-origin lock manager.
// Supports: request(name, [{ifAvailable}], cb) and query(). crash() models a
// tab dying: the browser releases every lock the tab held.
function makeLockManager() {
  const held = new Set()
  const waiters = new Map() // name -> resolve[]

  async function request(name, optionsOrCb, maybeCb) {
    const [options, cb] = typeof optionsOrCb === 'function' ? [{}, optionsOrCb] : [optionsOrCb || {}, maybeCb]
    if (held.has(name)) {
      if (options.ifAvailable) return cb(null)
      await new Promise((resolve) => {
        if (!waiters.has(name)) waiters.set(name, [])
        waiters.get(name).push(resolve)
      })
      // ownership was handed over directly (see finally), `held` is still set
    } else {
      held.add(name)
    }
    try {
      return await cb({ name, mode: 'exclusive' })
    } finally {
      const next = waiters.get(name)?.shift()
      if (next) next() // hand over without ever making the lock look free
      else held.delete(name)
    }
  }

  return {
    request,
    query: async () => ({ held: [...held].map((name) => ({ name, mode: 'exclusive' })), pending: [] }),
    crash: () => { held.clear(); waiters.clear() },
    heldNames: () => [...held],
  }
}

let manager

function installLocks(on = true) {
  Object.defineProperty(window.navigator, 'locks', { value: on ? manager : undefined, configurable: true })
}

// A "tab" = a fresh copy of the module (own in-memory state) sharing storage + locks.
async function openTab() {
  vi.resetModules()
  return import('./automationsService')
}

async function makeAutomation(tab, { due = true, schedule = 'hourly', enabled = true } = {}) {
  const a = await tab.createAutomation({
    name: 'Test automation',
    agentId: 'agent-1',
    agentName: 'Agent',
    category: 'Test',
    provider: 'openai',
    model: 'gpt-4o',
    schedule,
    inputs: { topic: 'x' },
    systemPrompt: 'sys',
    apiKey: 'sk-test-key',
    enabled,
  })
  if (due) await tab.updateAutomation(a.id, { nextRunAt: Date.now() - 1000 })
  return a.id
}

const allRuns = (id) => JSON.parse(localStorage.getItem(RUNS_KEY) || '[]').filter((r) => r.automationId === id)
const providerCalls = () => globalThis.__runAgent.mock.calls.length

beforeEach(() => {
  localStorage.clear()
  manager = makeLockManager()
  installLocks(true)
  globalThis.__runAgent = vi.fn(async () => ({ content: 'OUT', tokens: 10, duration: 5 }))
  // Engines start a 60s heartbeat; keep those inert so tests drive ticks explicitly.
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('automation engine: single tab (existing behaviour that must keep working)', () => {
  it('runs a due automation once, records it and schedules the next run', async () => {
    const tab = await openTab()
    const id = await makeAutomation(tab)

    tab.initAutomationEngine()
    expect(await until(() => allRuns(id).some((r) => r.status === 'success'))).toBe(true)
    await sleep(40)

    expect(providerCalls()).toBe(1)
    expect(allRuns(id)).toHaveLength(1)
    expect(tab.getAutomation(id).nextRunAt).toBeGreaterThan(Date.now())
  })

  it('does not run disabled or not-yet-due automations', async () => {
    const tab = await openTab()
    await makeAutomation(tab, { enabled: false })
    await makeAutomation(tab, { due: false })

    tab.initAutomationEngine()
    await sleep(60)

    expect(providerCalls()).toBe(0)
  })

  it('rejects a second concurrent manual run of the same automation in the same tab', async () => {
    globalThis.__runAgent = vi.fn(async () => { await sleep(30); return { content: 'OUT', tokens: 1, duration: 30 } })
    const tab = await openTab()
    const id = await makeAutomation(tab, { due: false })

    const results = await Promise.allSettled([tab.runAutomationNow(id), tab.runAutomationNow(id)])

    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
    expect(results.find((r) => r.status === 'rejected').reason.message).toMatch(/currently executing/i)
  })
})

describe('automation engine: one owner per run across tabs', () => {
  it('two tabs with the engine running execute a due automation exactly once', async () => {
    globalThis.__runAgent = vi.fn(async () => { await sleep(40); return { content: 'OUT', tokens: 1, duration: 40 } })
    const tabA = await openTab()
    const id = await makeAutomation(tabA)
    const tabB = await openTab()

    tabA.initAutomationEngine()
    tabB.initAutomationEngine()

    expect(await until(() => allRuns(id).some((r) => r.status === 'success'))).toBe(true)
    await sleep(120) // give a (buggy) second run time to show up

    expect(providerCalls()).toBe(1)
    expect(allRuns(id)).toHaveLength(1)
  })

  it('a tab working through a stale snapshot does not re-run an automation another tab already finished', async () => {
    // Y is slow, X is fast. Tab B starts its pass with both due, spends a while on Y,
    // and meanwhile tab A runs X to completion. When B finally reaches X its snapshot
    // still says "due", but X has already been run and rescheduled.
    globalThis.__runAgent = vi.fn(async ({ userMessage }) => {
      if (userMessage.includes('slow')) await sleep(100)
      return { content: 'OUT', tokens: 1, duration: 1 }
    })
    const tabA = await openTab()
    const mk = async (topic) => {
      const a = await tabA.createAutomation({
        name: topic, agentId: 'a', agentName: 'A', category: 'T', provider: 'openai', model: 'gpt-4o',
        schedule: 'hourly', inputs: { topic }, systemPrompt: 's', apiKey: 'sk-test-key',
      })
      await tabA.updateAutomation(a.id, { nextRunAt: Date.now() - 1000 })
      return a.id
    }
    const fastId = await mk('fast') // created first => listed after the slow one
    const slowId = await mk('slow')
    const tabB = await openTab()

    tabB.initAutomationEngine() // B: snapshot [slow, fast], claims and runs slow (100ms)
    await sleep(20)
    await tabA.runAutomationNow(fastId) // A finishes `fast` while B is still busy with `slow`

    expect(await until(() => allRuns(slowId).some((r) => r.status === 'success'))).toBe(true)
    await sleep(80)

    const byTopic = (topic) => globalThis.__runAgent.mock.calls.filter(([a]) => a.userMessage.includes(topic)).length
    expect(byTopic('slow')).toBe(1)
    expect(byTopic('fast')).toBe(1) // not 2: B must not re-run what A just finished
    expect(allRuns(fastId)).toHaveLength(1)
  })

  it('a manual run in one tab blocks a manual run of the same automation in another tab', async () => {
    globalThis.__runAgent = vi.fn(async () => { await sleep(40); return { content: 'OUT', tokens: 1, duration: 40 } })
    const tabA = await openTab()
    const id = await makeAutomation(tabA, { due: false })
    const tabB = await openTab()

    const results = await Promise.allSettled([tabA.runAutomationNow(id), tabB.runAutomationNow(id)])

    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
    expect(results.find((r) => r.status === 'rejected').reason.message).toMatch(/currently executing/i)
    expect(providerCalls()).toBe(1)
  })
})

describe('automation engine: interrupted runs', () => {
  it('a run whose tab died mid-flight is not left "running" forever', async () => {
    globalThis.__runAgent = vi.fn(() => new Promise(() => {})) // provider call that never returns
    const tabA = await openTab()
    const id = await makeAutomation(tabA, { due: false })

    tabA.runAutomationNow(id).catch(() => {})
    expect(await until(() => allRuns(id).some((r) => r.status === 'running'))).toBe(true)

    manager.crash() // the tab is closed / crashes: the browser drops its locks
    const tabB = await openTab() // user reopens the app
    tabB.initAutomationEngine()

    expect(await until(() => allRuns(id).every((r) => r.status !== 'running'))).toBe(true)
    const run = allRuns(id)[0]
    expect(run.status).toBe('failed')
    expect(run.error).toMatch(/interrupted/i)
    expect(run.completedAt).toBeTruthy()
  })

  it("does not mistake another tab's live run for an interrupted one", async () => {
    globalThis.__runAgent = vi.fn(async () => { await sleep(120); return { content: 'OUT', tokens: 1, duration: 120 } })
    const tabA = await openTab()
    const id = await makeAutomation(tabA, { due: false })
    const tabB = await openTab()

    const running = tabA.runAutomationNow(id)
    expect(await until(() => allRuns(id).some((r) => r.status === 'running'))).toBe(true)

    tabB.initAutomationEngine() // runs recovery while A's run is genuinely in flight
    await sleep(40)
    expect(allRuns(id)[0].status).toBe('running')

    await running
    expect(allRuns(id)[0].status).toBe('success')
  })

  it('without Web Locks, only runs older than the stale threshold are treated as interrupted', async () => {
    installLocks(false)
    const tab = await openTab()
    const id = await makeAutomation(tab, { due: false })
    const base = { automationId: id, automationName: 'x', agentName: 'a', completedAt: null, duration: 0, tokens: 0, output: '', error: null, emailSent: false }
    localStorage.setItem(RUNS_KEY, JSON.stringify([
      { ...base, id: 'run_fresh', status: 'running', startedAt: Date.now() - 60 * 1000 },
      { ...base, id: 'run_stale', status: 'running', startedAt: Date.now() - 60 * 60 * 1000 },
    ]))

    tab.initAutomationEngine()
    await sleep(60)

    const byId = Object.fromEntries(allRuns(id).map((r) => [r.id, r]))
    expect(byId.run_stale.status).toBe('failed')
    expect(byId.run_stale.error).toMatch(/interrupted/i)
    expect(byId.run_fresh.status).toBe('running')
  })
})

describe('automation engine: failure handling', () => {
  it('deleting an automation while it is running does not cause an unhandled rejection', async () => {
    globalThis.__runAgent = vi.fn(async () => { await sleep(30); return { content: 'OUT', tokens: 1, duration: 30 } })
    const tab = await openTab()
    const id = await makeAutomation(tab, { due: false })
    const unhandled = []
    const onUnhandled = (e) => unhandled.push(e)
    process.on('unhandledRejection', onUnhandled)

    const running = tab.runAutomationNow(id)
    await sleep(5)
    await tab.deleteAutomation(id)
    await running
    await sleep(30)
    process.off('unhandledRejection', onUnhandled)

    expect(unhandled).toHaveLength(0)
  })
})
