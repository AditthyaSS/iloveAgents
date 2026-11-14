
import { createClient } from '@supabase/supabase-js'
import { timingSafeEqual } from 'node:crypto'

// --------------------------------------
// CONFIGURATION
// --------------------------------------

export const SUPPORTED_CRON_PROVIDERS = [
  'openai',
  'anthropic',
  'gemini',
  'openrouter'
]

const MAX_AUTOMATIONS = 10
const REQUEST_TIMEOUT = 30000
const CLAIM_TIMEOUT = 15 * 60 * 1000

// --------------------------------------
// SECURITY HELPERS
// --------------------------------------

function safeEqual(a, b) {
  if (!a || !b) return false

  const first = Buffer.from(a)
  const second = Buffer.from(b)

  if (first.length !== second.length) return false

  return timingSafeEqual(first, second)
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char])
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()

  const timeout = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT
  )

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('API request timed out')
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}

// --------------------------------------
// PROVIDER REQUEST BUILDER
// --------------------------------------

export function buildCronRequest(
  provider,
  apiKey,
  model,
  systemPrompt,
  userMessage
) {
  const prov = (provider || 'openai').toLowerCase()

  if (!SUPPORTED_CRON_PROVIDERS.includes(prov)) {
    throw new Error('Unsupported AI provider')
  }

  if (!apiKey) {
    throw new Error('API key is missing')
  }

  const sys = systemPrompt || 'You are an AI assistant.'
  const msg = userMessage || 'Scheduled run'

  if (prov === 'anthropic') {
    return {
      url: 'https://api.anthropic.com/v1/messages',

      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },

      body: {
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: sys,
        messages: [
          { role: 'user', content: msg }
        ]
      }
    }
  }

  if (prov === 'gemini') {
    const targetModel = model || 'gemini-2.5-flash'

    return {
      url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(targetModel)}:generateContent`,

      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },

      body: {
        systemInstruction: {
          parts: [{ text: sys }]
        },

        contents: [{
          role: 'user',
          parts: [{ text: msg }]
        }],

        generationConfig: {
          maxOutputTokens: 4096
        }
      }
    }
  }

  if (prov === 'openrouter') {
    return {
      url: 'https://openrouter.ai/api/v1/chat/completions',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://iloveagents.ai',
        'X-Title': 'ILoveAgents'
      },

      body: {
        model: model || 'openai/gpt-4o-mini',

        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: msg }
        ],

        max_tokens: 4096
      }
    }
  }

  return {
    url: 'https://api.openai.com/v1/chat/completions',

    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },

    body: {
      model: model || 'gpt-4o-mini',

      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: msg }
      ],

      max_tokens: 4096
    }
  }
}

// --------------------------------------
// RESPONSE PARSER
// --------------------------------------

export function parseCronResponse(provider, json) {
  if (!json || typeof json !== 'object') {
    return 'No output generated'
  }

  const prov = (provider || 'openai').toLowerCase()

  let output

  if (prov === 'anthropic') {
    output = json.content
      ?.filter(item => item.type === 'text')
      .map(item => item.text)
      .join('\n')
  } else if (prov === 'gemini') {
    output = json.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('\n')
  } else {
    output = json.choices?.[0]?.message?.content
  }

  if (typeof output !== 'string' || !output.trim()) {
    throw new Error('Provider returned an empty response')
  }

  return output
}

// --------------------------------------
// AI EXECUTION
// --------------------------------------

async function executeAI(
  provider,
  apiKey,
  model,
  systemPrompt,
  userMessage
) {
  const config = buildCronRequest(
    provider,
    apiKey,
    model,
    systemPrompt,
    userMessage
  )

  const response = await fetchWithTimeout(config.url, {
    method: 'POST',
    headers: config.headers,
    body: JSON.stringify(config.body)
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')

    // Do not expose provider error bodies or credentials
    // in API responses.
    console.error(
      `${provider} API error:`,
      response.status,
      errorText.slice(0, 300)
    )

    throw new Error(
      `${provider} API request failed (${response.status})`
    )
  }

  const json = await response.json()

  return parseCronResponse(provider, json)
}

// --------------------------------------
// EMAIL NOTIFICATION
// --------------------------------------

export async function sendCronEmailNotification(
  apiKey,
  { to, name, output }
) {
  if (!apiKey || !to) {
    throw new Error('Email configuration is missing')
  }

  const response = await fetchWithTimeout(
    'https://api.resend.com/emails',
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },

      body: JSON.stringify({
        from: 'Open Agents Hub <automations@openagentshub.dev>',
        to: [to],

        subject: `[Open Agents Hub] Completed: ${name}`,

        html: `
          <h2>${escapeHtml(name)} Run Output</h2>
          <pre>${escapeHtml(output)}</pre>
        `
      })
    }
  )

  if (!response.ok) {
    console.error(
      'Email notification failed:',
      response.status
    )

    throw new Error('Email notification failed')
  }

  return response.json()
}

// --------------------------------------
// SECRET DECRYPTION
// --------------------------------------

async function getAutomationApiKey(supabase, automationId) {

  // IMPORTANT:
  // This RPC must be implemented using your actual
  // pgsodium encryption setup.
  //
  // It must return the decrypted API key only to
  // this trusted server-side service-role client.

  const { data, error } = await supabase.rpc(
    'decrypt_automation_api_key',
    {
      p_automation_id: automationId
    }
  )

  if (error) {
    console.error('Secret decryption failed:', error.message)
    throw new Error('Unable to decrypt automation API key')
  }

  const apiKey = typeof data === 'string'
    ? data
    : data?.api_key

  if (!apiKey || typeof apiKey !== 'string') {
    throw new Error('API key not found')
  }

  return apiKey
}

// --------------------------------------
// SCHEDULE CALCULATION
// --------------------------------------

function getNextRun(schedule) {
  const intervals = {
    hourly: 60 * 60 * 1000,
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000
  }

  const interval = intervals[schedule]

  if (!interval) {
    throw new Error('Invalid automation schedule')
  }

  return new Date(Date.now() + interval).toISOString()
}

// --------------------------------------
// CRON HANDLER
// --------------------------------------

export default async function handler(req, res) {

  const startTime = Date.now()

  res.setHeader('Cache-Control', 'no-store')

  // 1. Validate HTTP method

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed'
    })
  }

  // 2. Validate cron authentication

  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.authorization

  if (
    !cronSecret ||
    !safeEqual(
      authHeader,
      `Bearer ${cronSecret}`
    )
  ) {
    return res.status(401).json({
      error: 'Unauthorized'
    })
  }

  try {

    // 3. Validate Supabase credentials

    const supabaseUrl = process.env.SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      throw new Error('Supabase configuration missing')
    }

    const supabase = createClient(
      supabaseUrl,
      serviceKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    )

    // 4. Find due automations

    const now = new Date().toISOString()

    const { data: automations, error: fetchError } =
      await supabase
        .from('automations')
        .select('*')
        .eq('enabled', true)
        .lte('next_run_at', now)
        .order('next_run_at', { ascending: true })
        .limit(MAX_AUTOMATIONS)

    if (fetchError) {
      throw fetchError
    }

    if (!automations?.length) {
      return res.status(200).json({
        success: true,
        message: 'No automations currently due',
        processedCount: 0,
        duration: Date.now() - startTime
      })
    }

    const results = []

    // 5. Execute automations

    for (const auto of automations) {

      const autoStart = Date.now()

      let status = 'success'
      let output = ''
      let errorMessage = null

      try {

        // 6. Claim automation to prevent duplicate runs

        const leaseUntil = new Date(
          Date.now() + CLAIM_TIMEOUT
        ).toISOString()

        const { data: claimed, error: claimError } =
          await supabase
            .from('automations')
            .update({
              next_run_at: leaseUntil
            })
            .eq('id', auto.id)
            .eq('enabled', true)
            .eq('next_run_at', auto.next_run_at)
            .select('id')
            .maybeSingle()

        if (claimError) {
          throw claimError
        }

        if (!claimed) {
          results.push({
            id: auto.id,
            status: 'skipped',
            reason: 'Already claimed by another worker'
          })

          continue
        }

        // 7. Retrieve decrypted API key

        const apiKey = await getAutomationApiKey(
          supabase,
          auto.id
        )

        // 8. Prepare user input

        const parts = []

        if (auto.inputs && typeof auto.inputs === 'object') {
          for (const [key, value] of Object.entries(auto.inputs)) {
            if (value !== null && value !== undefined && value !== '') {
              parts.push(
                `${key}: ${
                  Array.isArray(value)
                    ? value.join(', ')
                    : typeof value === 'object'
                      ? JSON.stringify(value)
                      : String(value)
                }`
              )
            }
          }
        }

        const userMessage = parts.join('\n\n') || 'Scheduled run'

        // 9. Execute AI provider

        const provider = (auto.provider || 'openai').toLowerCase()

        output = await executeAI(
          provider,
          apiKey,
          auto.model,
          auto.system_prompt,
          userMessage
        )

        // 10. Send notification

        if (
          auto.email_notification &&
          auto.notification_email &&
          process.env.RESEND_API_KEY
        ) {
          await sendCronEmailNotification(
            process.env.RESEND_API_KEY,
            {
              to: auto.notification_email,
              name: auto.name,
              output
            }
          )
        }

      } catch (err) {

        status = 'failed'

        errorMessage = err.message || 'Execution failed'

        console.error(
          `Automation ${auto.id} failed:`,
          errorMessage
        )
      }

      // 11. Save run history

      const duration = Date.now() - autoStart

      const runId = `run_${Date.now()}_${Math.random()
        .toString(36).slice(2, 9)}`

      const { error: insertError } = await supabase
        .from('automation_runs')
        .insert({
          id: runId,
          automation_id: auto.id,
          automation_name: auto.name,
          agent_name: auto.agent_name,
          status,
          duration,
          output,
          error: errorMessage,
          started_at: new Date(autoStart).toISOString(),
          completed_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Run history insert failed:', insertError.message)
        throw insertError
      }

      // 12. Update next execution time

      const { error: updateError } = await supabase
        .from('automations')
        .update({
          last_run_at: new Date().toISOString(),
          next_run_at: getNextRun(auto.schedule)
        })
        .eq('id', auto.id)

      if (updateError) {
        console.error('Schedule update failed:', updateError.message)
        throw updateError
      }

      results.push({
        id: auto.id,
        name: auto.name,
        status,
        duration
      })
    }

    // 13. Return execution summary

    return res.status(200).json({
      success: true,
      processedCount: results.filter(
        item => item.status !== 'skipped'
      ).length,
      results,
      duration: Date.now() - startTime
    })

  } catch (err) {

    console.error('Cron handler error:', err)

    return res.status(500).json({
      success: false,
      error: 'Cron execution failed'
    })
  }
}
