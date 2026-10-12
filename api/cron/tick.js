/**
 * Vercel Cron Handler: /api/cron/tick
 *
 * Runs automatically on the schedule configured for the cron. Authenticates
 * using the CRON_SECRET authorization header, selects due automations, CLAIMS
 * each one atomically, executes the LLM run with the stored (encrypted) key,
 * logs run history, and sends a notification email via Resend.
 *
 * Execution model (important):
 *   1. SELECT the automations that are due.
 *   2. CLAIM each one with a conditional UPDATE that moves `next_run_at` into
 *      the future *before* any work happens. Only the invocation whose UPDATE
 *      matches a row owns the run; concurrent / overlapping invocations lose
 *      the claim and skip it. Because `next_run_at` is already advanced, a
 *      function that is killed mid-run (platform timeout) is NOT replayed on
 *      every following tick (which would re-bill the provider each time).
 *   3. Execute, record the run, and send the notification.
 */

import { webcrypto } from 'node:crypto'
import { runAgent } from '../../src/lib/llmAdapter.js'
import { decryptSecret } from '../../src/lib/automationCrypto.js'

const MAX_DUE_PER_TICK = 10

const INTERVAL_MS = {
  hourly: 60 * 60 * 1000,
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
}

function intervalFor(schedule) {
  return INTERVAL_MS[schedule] ?? INTERVAL_MS.daily
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * llmAdapter throws a plain object (not an Error) for 401s, so `err.message`
 * alone would lose the reason.
 */
function describeError(err) {
  if (!err) return 'Execution error'
  if (typeof err === 'string') return err
  if (err.message) return err.message
  if (err.type === 'invalid_api_key') {
    return `Invalid API key for ${err.provider || 'provider'}: ${err.detail || 'no details'}`
  }
  return err.detail || 'Execution error'
}

/**
 * Atomically claim a due automation. Resolves true only for the single
 * invocation whose conditional UPDATE actually changed the row.
 */
async function claimAutomation(supabase, auto) {
  const now = Date.now()
  const { data, error } = await supabase
    .from('automations')
    .update({ next_run_at: new Date(now + intervalFor(auto.schedule)).toISOString() })
    .eq('id', auto.id)
    .eq('enabled', true)
    .lte('next_run_at', new Date(now).toISOString())
    .select('id')

  if (error) {
    console.error(`Could not claim automation ${auto.id}:`, error)
    return false
  }
  return Array.isArray(data) && data.length === 1
}

/** Run the LLM call for a claimed automation. Throws on any failure. */
async function executeAutomation(supabase, auto) {
  const { data: secretData } = await supabase
    .from('user_secrets')
    .select('encrypted_key')
    .eq('automation_id', auto.id)
    .single()

  // Same code the browser used to encrypt the key (AES-GCM, legacy base64 accepted).
  const apiKey = await decryptSecret(secretData?.encrypted_key, webcrypto)
  if (!apiKey) {
    throw new Error('API key not found in encrypted secret vault.')
  }

  const parts = []
  if (auto.inputs) {
    Object.entries(auto.inputs).forEach(([k, v]) => {
      if (v) parts.push(`${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
    })
  }
  const userMessage = parts.join('\n\n') || 'Scheduled run'

  const provider = auto.provider || 'openai'
  const model = auto.model || (provider === 'openai' ? 'gpt-4o-mini' : '')
  if (!model) {
    throw new Error(`No model configured for provider "${provider}".`)
  }

  // runAgent supports every provider and throws on non-2xx responses, so a
  // 401/429/5xx can no longer be recorded as a successful run.
  const result = await runAgent({
    provider,
    model,
    apiKey,
    systemPrompt: auto.system_prompt || 'You are an AI assistant.',
    userMessage,
  })

  return result.content || 'No output generated'
}

/** Best-effort notification. Never throws: a mail problem is not a run failure. */
async function sendNotification(auto, output) {
  if (!auto.email_notification || !auto.notification_email || !process.env.RESEND_API_KEY) return

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Open Agents Hub <automations@openagentshub.dev>',
        to: [auto.notification_email],
        subject: `[Open Agents Hub] ✅ Completed: ${auto.name}`,
        // Model output is untrusted: escape it before putting it in HTML.
        html: `<h2>${escapeHtml(auto.name)} Run Output</h2><pre>${escapeHtml(output)}</pre>`,
      }),
    })
    if (!resp.ok) {
      console.warn(`Resend responded with ${resp.status} for automation ${auto.id}`)
    }
  } catch (e) {
    console.warn(`Notification email failed for automation ${auto.id}:`, e)
  }
}

export default async function handler(req, res) {
  // Verify Cron Secret if configured
  const authHeader = req.headers.authorization || req.headers['authorization']
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Cron Secret' })
  }

  const startTime = Date.now()
  const results = []
  let skipped = 0

  try {
    // In serverless environment, connect to Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(200).json({
        message: 'Open Agents Hub Cron Tick executed (Serverless simulated mode)',
        processedCount: 0,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
      })
    }

    // Dynamic import to avoid missing packaging errors if standard client is used
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const nowIso = new Date().toISOString()

    // Fetch due automations, most overdue first so a backlog drains fairly.
    const { data: dueAutomations, error: fetchError } = await supabase
      .from('automations')
      .select('*')
      .eq('enabled', true)
      .lte('next_run_at', nowIso)
      .order('next_run_at', { ascending: true })
      .limit(MAX_DUE_PER_TICK)

    if (fetchError) {
      throw fetchError
    }

    if (!dueAutomations || dueAutomations.length === 0) {
      return res.status(200).json({
        message: 'No automations currently due',
        processedCount: 0,
        duration: Date.now() - startTime,
      })
    }

    for (const auto of dueAutomations) {
      // Another invocation may already own this run (or the user just disabled it).
      if (!(await claimAutomation(supabase, auto))) {
        skipped += 1
        continue
      }

      const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      const autoStart = Date.now()
      let status = 'success'
      let output = ''
      let error = null

      try {
        output = await executeAutomation(supabase, auto)
      } catch (err) {
        status = 'failed'
        error = describeError(err)
      }

      if (status === 'success') {
        await sendNotification(auto, output)
      }

      const autoDuration = Date.now() - autoStart

      const { error: insertError } = await supabase.from('automation_runs').insert({
        id: runId,
        automation_id: auto.id,
        automation_name: auto.name,
        agent_name: auto.agent_name,
        status,
        duration: autoDuration,
        output,
        error,
        started_at: new Date(autoStart).toISOString(),
        completed_at: new Date().toISOString(),
      })
      if (insertError) {
        console.error(`Could not record run ${runId} for automation ${auto.id}:`, insertError)
      }

      // next_run_at was already advanced by the claim; only stamp completion here.
      await supabase
        .from('automations')
        .update({ last_run_at: new Date().toISOString() })
        .eq('id', auto.id)

      results.push({ id: auto.id, name: auto.name, status, duration: autoDuration })
    }

    return res.status(200).json({
      success: true,
      processedCount: results.length,
      skippedCount: skipped,
      results,
      duration: Date.now() - startTime,
    })
  } catch (error) {
    console.error('Cron error:', error)
    return res.status(500).json({ error: error.message || 'Cron execution failed' })
  }
}
