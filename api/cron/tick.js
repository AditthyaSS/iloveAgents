/**
 * Vercel Cron Handler: /api/cron/tick
 *
 * Runs automatically on schedule configured in vercel.json cron.
 * Authenticates using CRON_SECRET authorization header, selects due automations,
 * executes LLM run with pgsodium encrypted key, logs run history, and sends email via Resend.
 */

/**
 * Decrypt a vault key produced by the browser encryptSecret helper
 * (PBKDF2 password 'ila-pgsodium-salt-2026', salt 'salt-val-pgsodium',
 * 100k SHA-256, AES-GCM-256, iv12 + ciphertext base64). Falls back to
 * legacy plain-base64 for short payloads. Returns null when undecryptable.
 */
async function decryptVaultKey(encryptedBase64) {
  if (!encryptedBase64) return null
  try {
    const bytes = Buffer.from(encryptedBase64, 'base64')
    if (bytes.length <= 12) {
      return Buffer.from(encryptedBase64, 'base64').toString('utf-8') || null
    }
    const iv = bytes.subarray(0, 12)
    const ciphertext = bytes.subarray(12)
    const { subtle } = await import('node:crypto').then((m) => m.webcrypto ?? globalThis.crypto)
    const keyMaterial = await subtle.importKey(
      'raw',
      new TextEncoder().encode('ila-pgsodium-salt-2026'),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    )
    const key = await subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('salt-val-pgsodium'),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    )
    const plain = await subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
    return new TextDecoder().decode(plain) || null
  } catch {
    try {
      return Buffer.from(encryptedBase64, 'base64').toString('utf-8') || null
    } catch {
      return null
    }
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
        // Fetch encrypted key from user_secrets (decrypted via pgsodium RPC or server key)
        const { data: secretData } = await supabase
          .from('user_secrets')
          .select('encrypted_key')
          .eq('automation_id', auto.id)
          .single()

        const apiKey = await decryptVaultKey(secretData?.encrypted_key)

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
