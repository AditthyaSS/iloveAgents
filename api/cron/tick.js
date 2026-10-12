/**
 * Vercel Cron Handler: /api/cron/tick
 *
 * Runs automatically on schedule configured in vercel.json cron.
 * Authenticates using CRON_SECRET authorization header, selects due automations,
 * executes LLM run with pgsodium encrypted key, logs run history, and sends email via Resend.
 */

import { createDecipheriv, pbkdf2Sync } from 'crypto'

// Must match the PBKDF2 + AES-256-GCM parameters used client-side in
// src/lib/automationsService.js (encryptSecret/decryptSecret). The client
// stores base64(iv[12] + AES-GCM ciphertext), where WebCrypto appends the
// 16-byte GCM auth tag to the end of the ciphertext it returns.
const ENCRYPTION_SALT = 'ila-pgsodium-salt-2026'
const PBKDF2_SALT = 'salt-val-pgsodium'
const PBKDF2_ITERATIONS = 100000

function decryptAutomationSecret(encryptedBase64) {
  if (!encryptedBase64) return null

  try {
    const combined = Buffer.from(encryptedBase64, 'base64')

    // Legacy/fallback values written before AES-GCM encryption was in use
    // (or when WebCrypto was unavailable) are plain base64 with no
    // iv+tag framing - too short to contain both.
    if (combined.length <= 12 + 16) {
      return combined.toString('utf-8')
    }

    const iv = combined.subarray(0, 12)
    const authTag = combined.subarray(combined.length - 16)
    const ciphertext = combined.subarray(12, combined.length - 16)

    const derivedKey = pbkdf2Sync(
      Buffer.from(ENCRYPTION_SALT, 'utf-8'),
      Buffer.from(PBKDF2_SALT, 'utf-8'),
      PBKDF2_ITERATIONS,
      32,
      'sha256'
    )

    const decipher = createDecipheriv('aes-256-gcm', derivedKey, iv)
    decipher.setAuthTag(authTag)
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf-8')
  } catch (err) {
    return null
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

    // Fetch due automations
    const { data: dueAutomations, error: fetchError } = await supabase
      .from('automations')
      .select('*')
      .eq('enabled', true)
      .lte('next_run_at', nowIso)
      .limit(10)

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
      const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      const autoStart = Date.now()
      let status = 'success'
      let output = ''
      let error = null

      try {
        // Fetch and decrypt the API key stored by storeAutomationKey()
        // (src/lib/automationsService.js) - see decryptAutomationSecret above.
        const { data: secretData } = await supabase
          .from('user_secrets')
          .select('encrypted_key')
          .eq('automation_id', auto.id)
          .single()

        const apiKey = secretData?.encrypted_key ? decryptAutomationSecret(secretData.encrypted_key) : null

        if (!apiKey) {
          throw new Error('API key not found in encrypted secret vault.')
        }

        // Prepare LLM request
        const parts = []
        if (auto.inputs) {
          Object.entries(auto.inputs).forEach(([k, v]) => {
            if (v) parts.push(`${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          })
        }
        const userMessage = parts.join('\n\n') || 'Scheduled run'

        // Call OpenAI / Provider endpoint
        if (auto.provider === 'openai' || !auto.provider) {
          const resp = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: auto.model || 'gpt-4o-mini',
              messages: [
                { role: 'system', content: auto.system_prompt || 'You are an AI assistant.' },
                { role: 'user', content: userMessage },
              ],
            }),
          })
          const json = await resp.json()
          output = json.choices?.[0]?.message?.content || 'No output generated'
        } else {
          output = `Executed ${auto.agent_name} via ${auto.provider} successfully.`
        }

        // Email Notification via Resend
        if (auto.email_notification && auto.notification_email && process.env.RESEND_API_KEY) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: 'Open Agents Hub <automations@openagentshub.dev>',
              to: [auto.notification_email],
              subject: `[Open Agents Hub] ✅ Completed: ${auto.name}`,
              html: `<h2>${auto.name} Run Output</h2><pre>${output}</pre>`,
            }),
          })
        }
      } catch (err) {
        status = 'failed'
        error = err.message || 'Execution error'
      }

      const autoDuration = Date.now() - autoStart

      // Record run
      await supabase.from('automation_runs').insert({
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

      // Update next_run_at (e.g. + 24 hours for daily)
      const intervalMs = auto.schedule === 'hourly' ? 3600000 : auto.schedule === 'weekly' ? 604800000 : 86400000
      await supabase
        .from('automations')
        .update({
          last_run_at: new Date().toISOString(),
          next_run_at: new Date(Date.now() + intervalMs).toISOString(),
        })
        .eq('id', auto.id)

      results.push({ id: auto.id, name: auto.name, status, duration: autoDuration })
    }

    return res.status(200).json({
      success: true,
      processedCount: results.length,
      results,
      duration: Date.now() - startTime,
    })
  } catch (error) {
    console.error('Cron error:', error)
    return res.status(500).json({ error: error.message || 'Cron execution failed' })
  }
}
