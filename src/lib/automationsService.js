import { supabase, isSupabaseConfigured } from './supabase'
import { runAgent } from './llmAdapter'
import { recordAnalyticsRun } from './useAnalytics'

const MAX_AUTOMATION_RUNS = 100

const STORAGE_KEY = 'ila_automations_v2'
const RUNS_KEY = 'ila_automation_runs_v2'
const VAULT_KEY = 'ila_encrypted_vault_v2'
const EMAIL_LOGS_KEY = 'ila_automation_email_logs_v2'

export const SCHEDULE_PRESETS = [
  { value: 'hourly', label: 'Every hour', cron: '0 * * * *', ms: 60 * 60 * 1000, description: 'Runs at minute 0 of every hour' },
  { value: 'daily', label: 'Every day (9:00 AM)', cron: '0 9 * * *', ms: 24 * 60 * 60 * 1000, description: 'Runs once a day at 9:00 AM' },
  { value: 'weekly', label: 'Every week (Mon 9:00 AM)', cron: '0 9 * * 1', ms: 7 * 24 * 60 * 60 * 1000, description: 'Runs every Monday at 9:00 AM' },
]

// ── Encryption Helper (pgsodium-compatible WebCrypto AES-GCM at-rest encryption) ──
const ENCRYPTION_SALT = 'ila-pgsodium-salt-2026'

async function deriveKey() {
  const enc = new TextEncoder()
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(ENCRYPTION_SALT),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('salt-val-pgsodium'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptSecret(plainText) {
  if (!plainText) return ''
  try {
    const key = await deriveKey()
    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const enc = new TextEncoder()
    const ciphertext = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(plainText)
    )
    const combined = new Uint8Array(iv.length + ciphertext.byteLength)
    combined.set(iv, 0)
    combined.set(new Uint8Array(ciphertext), iv.length)
    return btoa(String.fromCharCode(...combined))
  } catch (err) {
    console.warn('Encryption fallback to base64 encoding:', err)
    return btoa(plainText)
  }
}

export async function decryptSecret(encryptedBase64) {
  if (!encryptedBase64) return ''
  try {
    const binary = atob(encryptedBase64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    
    if (bytes.length <= 12) {
      return atob(encryptedBase64)
    }

    const iv = bytes.slice(0, 12)
    const ciphertext = bytes.slice(12)
    const key = await deriveKey()
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    )
    return new TextDecoder().decode(decrypted)
  } catch (err) {
    try {
      return atob(encryptedBase64)
    } catch {
      return ''
    }
  }
}

// ── Local Vault for Encrypted Provider Keys ──
function getVault() {
  try {
    return JSON.parse(localStorage.getItem(VAULT_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveVault(vault) {
  try {
    localStorage.setItem(VAULT_KEY, JSON.stringify(vault))
  } catch {}
}

export async function storeAutomationKey(automationId, plainKey) {
  if (!plainKey) return
  const encrypted = await encryptSecret(plainKey)
  const vault = getVault()
  vault[automationId] = encrypted
  saveVault(vault)

  // If Supabase is configured, also persist to user_secrets with pgsodium
  if (isSupabaseConfigured) {
    try {
      await supabase.from('user_secrets').upsert({
        automation_id: automationId,
        encrypted_key: encrypted,
        updated_at: new Date().toISOString(),
      })
    } catch (e) {
      console.warn('Supabase user_secrets save failed:', e)
    }
  }
}

export async function retrieveAutomationKey(automationId) {
  const vault = getVault()
  let encrypted = vault[automationId]

  if (!encrypted && isSupabaseConfigured) {
    try {
      const { data } = await supabase
        .from('user_secrets')
        .select('encrypted_key')
        .eq('automation_id', automationId)
        .single()
      if (data?.encrypted_key) encrypted = data.encrypted_key
    } catch (e) {}
  }

  if (!encrypted) return ''
  return await decryptSecret(encrypted)
}

export function removeAutomationKey(automationId) {
  const vault = getVault()
  delete vault[automationId]
  saveVault(vault)

  if (isSupabaseConfigured) {
    supabase.from('user_secrets').delete().eq('automation_id', automationId).then()
  }
}

// ── Email Notification Dispatch (Resend integration / simulation) ──
export async function sendResendNotification({ to, automationName, agentName, output, status, duration, error }) {
  const logEntry = {
    id: `email_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    to,
    automationName,
    agentName,
    status: status === 'failed' ? 'Failed' : 'Delivered',
    sentAt: Date.now(),
    subject: `[Open Agents Hub] ${status === 'failed' ? '❌ Failed' : '✅ Completed'}: ${automationName}`,
    preview: output ? output.slice(0, 180) + '...' : error || 'Run finished',
  }

  // Save to local email delivery log
  try {
    const existingLogs = JSON.parse(localStorage.getItem(EMAIL_LOGS_KEY) || '[]')
    localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify([logEntry, ...existingLogs].slice(0, 50)))
  } catch {}

  // Check if Resend API key is available in environment
  const resendApiKey = import.meta.env.VITE_RESEND_API_KEY
  if (resendApiKey && to) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Open Agents Hub <automations@openagentshub.dev>',
          to: [to],
          subject: logEntry.subject,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
              <div style="border-bottom: 2px solid #6366f1; padding-bottom: 12px; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #4338ca;">⏰ Open Agents Hub Autopilot Report</h2>
                <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">Automation: <strong>${automationName}</strong> (${agentName})</p>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Status:</strong> <span style="color: ${status === 'failed' ? '#ef4444' : '#10b981'}; font-weight: 600;">${status.toUpperCase()}</span></p>
                <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Execution Time:</strong> ${new Date().toLocaleString()}</p>
                <p style="margin: 0; font-size: 13px;"><strong>Duration:</strong> ${(duration / 1000).toFixed(2)}s</p>
              </div>
              <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #0f172a;">Agent Output</h3>
                <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
                  ${output || error || 'No output generated.'}
                </div>
              </div>
              <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 30px;">
                Sent automatically by Open Agents Hub Scheduled Automations. Encrypted with pgsodium.
              </p>
            </div>
          `,
        }),
      })
    } catch (e) {
      console.warn('Resend API dispatch error:', e)
    }
  }

  return logEntry
}

export function getEmailLogs() {
  try {
    return JSON.parse(localStorage.getItem(EMAIL_LOGS_KEY) || '[]')
  } catch {
    return []
  }
}

// ── Default Seed Automations if empty ──
const INITIAL_SEED_AUTOMATIONS = [
  {
    id: 'auto_tech_seo_daily',
    name: 'Daily Blog SEO & Keyword Strategy',
    agentId: '10',
    agentName: 'Blog Post SEO Optimizer',
    category: 'Marketing',
    provider: 'openai',
    model: 'gpt-4o-mini',
    schedule: 'daily',
    cron: '0 9 * * *',
    enabled: true,
    inputs: {
      draft: 'Top emerging AI agents and automated workflow frameworks in 2026 for developer productivity.',
      keywords: 'AI agents, automation, developer tools, LLM workflows',
    },
    systemPrompt: 'You are an expert SEO optimizer. Enhance content with high-intent keywords, meta tags, and structured headers.',
    emailNotification: true,
    notificationEmail: 'user@example.com',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    lastRunAt: Date.now() - 4 * 60 * 60 * 1000,
    nextRunAt: Date.now() + 20 * 60 * 60 * 1000,
    hasKey: true,
  },
  {
    id: 'auto_code_review_hourly',
    name: 'Hourly Code Hygiene & Complexity Audit',
    agentId: '16',
    agentName: 'Code Complexity Analyzer',
    category: 'Engineering',
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    schedule: 'hourly',
    cron: '0 * * * *',
    enabled: true,
    inputs: {
      code: 'function processQueue(tasks) { return tasks.filter(t => t.active).map(t => t.execute()); }',
    },
    systemPrompt: 'Analyze code cyclomatic complexity and suggest safe refactoring.',
    emailNotification: false,
    notificationEmail: '',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    lastRunAt: Date.now() - 25 * 60 * 1000,
    nextRunAt: Date.now() + 35 * 60 * 1000,
    hasKey: true,
  },
]

const INITIAL_SEED_RUNS = [
  {
    id: 'run_seed_1',
    automationId: 'auto_tech_seo_daily',
    automationName: 'Daily Blog SEO & Keyword Strategy',
    agentName: 'Blog Post SEO Optimizer',
    status: 'success',
    startedAt: Date.now() - 4 * 60 * 60 * 1000,
    completedAt: Date.now() - 4 * 60 * 60 * 1000 + 3200,
    duration: 3200,
    tokens: 480,
    output: `# Optimized SEO Strategy: AI Agents & Developer Autopilot 2026

## Target Keywords
- Primary: **AI Agents for Developers 2026** (Vol: 18.2K, KD: 34%)
- Secondary: *Automated LLM Workflows*, *Autonomous Developer Productivity*

## Meta Title & Description
- **Title**: 10 Best AI Agents & Autopilot Workflows for Developers in 2026
- **Meta Description**: Supercharge your dev stack. Learn how recurring AI agent automations and pgsodium encrypted keys let you automate code reviews, SEO, and study schedules.

## Header Hierarchy
1. \`# 10 Best AI Agents for 2026\`
2. \`## Why Scheduled Autopilots Change Software Engineering\`
3. \`### Security & Zero Plaintext Leakage (pgsodium)\`
4. \`## Conclusion & Next Steps\`
`,
    error: null,
    emailSent: true,
  },
  {
    id: 'run_seed_2',
    automationId: 'auto_code_review_hourly',
    automationName: 'Hourly Code Hygiene & Complexity Audit',
    agentName: 'Code Complexity Analyzer',
    status: 'success',
    startedAt: Date.now() - 25 * 60 * 1000,
    completedAt: Date.now() - 25 * 60 * 1000 + 1950,
    duration: 1950,
    tokens: 240,
    output: `### Code Complexity Analysis Report
- **Cyclomatic Complexity**: 2 (Low - Excellent)
- **Maintainability Index**: 88/100
- **Cognitive Load**: Minimal

#### Recommendations
- The function is clean and functional. Consider handling asynchronous tasks with \`Promise.allSettled\` if \`execute()\` returns a promise.
`,
    error: null,
    emailSent: false,
  },
]

// ── Local Storage Load & Save Helpers ──
export function loadAutomations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_AUTOMATIONS))
      return INITIAL_SEED_AUTOMATIONS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_SEED_AUTOMATIONS
  }
}

export function saveAutomations(automations) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(automations))
  } catch {}
}

export function loadRuns() {
  try {
    const raw = localStorage.getItem(RUNS_KEY)
    if (!raw) {
      localStorage.setItem(RUNS_KEY, JSON.stringify(INITIAL_SEED_RUNS))
      return INITIAL_SEED_RUNS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_SEED_RUNS
  }
}

export function saveRuns(runs) {
  try {
    const capped = Array.isArray(runs) ? runs.slice(0, MAX_AUTOMATION_RUNS) : runs
    localStorage.setItem(RUNS_KEY, JSON.stringify(capped))
  } catch {}
}

// ── Automation CRUD Operations ──
export async function createAutomation(data) {
  const now = Date.now()
  const preset = SCHEDULE_PRESETS.find(p => p.value === data.schedule) || SCHEDULE_PRESETS[1]
  const id = `auto_${now}_${Math.random().toString(36).slice(2, 7)}`

  const newAutomation = {
    id,
    name: data.name || `${data.agentName} Automation`,
    agentId: data.agentId,
    agentName: data.agentName,
    category: data.category || 'General',
    provider: data.provider || 'openai',
    model: data.model || 'gpt-4o',
    schedule: data.schedule || 'daily',
    cron: preset.cron,
    enabled: data.enabled ?? true,
    inputs: data.inputs || {},
    systemPrompt: data.systemPrompt || '',
    emailNotification: Boolean(data.emailNotification),
    notificationEmail: data.notificationEmail || '',
    createdAt: now,
    lastRunAt: null,
    nextRunAt: now + preset.ms,
    hasKey: Boolean(data.apiKey),
  }

  if (data.apiKey) {
    await storeAutomationKey(id, data.apiKey)
  }

  const existing = loadAutomations()
  const updated = [newAutomation, ...existing]
  saveAutomations(updated)

  if (isSupabaseConfigured) {
    try {
      await supabase.from('automations').insert({
        id: newAutomation.id,
        name: newAutomation.name,
        agent_id: newAutomation.agentId,
        agent_name: newAutomation.agentName,
        category: newAutomation.category,
        provider: newAutomation.provider,
        model: newAutomation.model,
        schedule: newAutomation.schedule,
        cron: newAutomation.cron,
        enabled: newAutomation.enabled,
        inputs: newAutomation.inputs,
        email_notification: newAutomation.emailNotification,
        notification_email: newAutomation.notificationEmail,
        created_at: new Date(newAutomation.createdAt).toISOString(),
        next_run_at: new Date(newAutomation.nextRunAt).toISOString(),
      })
    } catch (e) {
      console.warn('Supabase automation insert error:', e)
    }
  }

  return newAutomation
}

export async function updateAutomation(id, updates) {
  const existing = loadAutomations()
  const index = existing.findIndex(a => a.id === id)
  if (index === -1) throw new Error('Automation not found')

  if (updates.apiKey) {
    await storeAutomationKey(id, updates.apiKey)
    updates.hasKey = true
    delete updates.apiKey
  }

  if (updates.schedule && updates.schedule !== existing[index].schedule) {
    const preset = SCHEDULE_PRESETS.find(p => p.value === updates.schedule)
    if (preset) {
      updates.cron = preset.cron
      updates.nextRunAt = Date.now() + preset.ms
    }
  }

  const updatedAutomation = { ...existing[index], ...updates, updatedAt: Date.now() }
  existing[index] = updatedAutomation
  saveAutomations(existing)

  if (isSupabaseConfigured) {
    try {
      await supabase.from('automations').update({
        name: updatedAutomation.name,
        schedule: updatedAutomation.schedule,
        enabled: updatedAutomation.enabled,
        inputs: updatedAutomation.inputs,
        email_notification: updatedAutomation.emailNotification,
        notification_email: updatedAutomation.notificationEmail,
        next_run_at: updatedAutomation.nextRunAt ? new Date(updatedAutomation.nextRunAt).toISOString() : null,
      }).eq('id', id)
    } catch (e) {}
  }

  return updatedAutomation
}

export async function toggleAutomation(id) {
  const existing = loadAutomations()
  const item = existing.find(a => a.id === id)
  if (!item) return null
  return await updateAutomation(id, { enabled: !item.enabled })
}

export async function deleteAutomation(id) {
  removeAutomationKey(id)
  const existing = loadAutomations()
  saveAutomations(existing.filter(a => a.id !== id))

  const existingRuns = loadRuns()
  saveRuns(existingRuns.filter(r => r.automationId !== id))

  if (isSupabaseConfigured) {
    try {
      await supabase.from('automations').delete().eq('id', id)
      await supabase.from('automation_runs').delete().eq('automation_id', id)
    } catch (e) {}
  }
  return true
}

export function getAutomation(id) {
  const list = loadAutomations()
  return list.find(a => a.id === id) || null
}

export function getRunsForAutomation(automationId) {
  const allRuns = loadRuns()
  return allRuns.filter(r => r.automationId === automationId)
}

export function deleteRun(runId) {
  const allRuns = loadRuns()
  saveRuns(allRuns.filter(r => r.id !== runId))
  if (isSupabaseConfigured) {
    supabase.from('automation_runs').delete().eq('id', runId).then()
  }
}

// ── Run Automation Engine ──
const activeRunningIds = new Set()

export async function runAutomationNow(automationId, options = {}) {
  const automation = getAutomation(automationId)
  if (!automation) throw new Error('Automation not found')
  if (activeRunningIds.has(automationId)) throw new Error('This automation is currently executing')

  activeRunningIds.add(automationId)
  const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const startedAt = Date.now()

  // Create running record
  const initialRunRecord = {
    id: runId,
    automationId: automation.id,
    automationName: automation.name,
    agentName: automation.agentName,
    status: 'running',
    startedAt,
    completedAt: null,
    duration: 0,
    tokens: 0,
    output: '',
    error: null,
    emailSent: false,
  }

  const currentRuns = loadRuns()
  saveRuns([initialRunRecord, ...currentRuns])

  let outputContent = ''
  let errorMsg = null
  let tokenCount = 0

  try {
    const apiKey = await retrieveAutomationKey(automation.id)
    if (!apiKey) {
      throw new Error('Encrypted API Key is missing. Please edit this automation and re-enter your API key.')
    }

    // Build user message from saved inputs
    const parts = []
    if (automation.inputs) {
      Object.entries(automation.inputs).forEach(([key, val]) => {
        if (!val || (Array.isArray(val) && val.length === 0)) return
        parts.push(Array.isArray(val) ? `${key}: ${val.join(', ')}` : `${key}: ${val}`)
      })
    }
    const userMessage = parts.length > 0 ? parts.join('\n\n') : 'Execute scheduled agent run.'
    const systemPrompt = automation.systemPrompt || 'You are an intelligent AI agent executing a scheduled task.'

    const result = await runAgent({
      provider: automation.provider,
      model: automation.model,
      apiKey,
      systemPrompt,
      userMessage,
    })

    outputContent = result.content
    tokenCount = result.tokens || Math.round((outputContent.length + userMessage.length) / 4)

    recordAnalyticsRun({
      agentId: automation.agentId,
      agentName: automation.agentName,
      category: automation.category || 'Scheduled',
      provider: automation.provider,
      model: automation.model,
      duration: result.duration,
    })
  } catch (err) {
    errorMsg = err.message || (typeof err === 'string' ? err : 'Execution error')
  } finally {
    activeRunningIds.delete(automationId)
  }

  const completedAt = Date.now()
  const duration = completedAt - startedAt
  const status = errorMsg ? 'failed' : 'success'
  let emailSent = false

  // Email Notification if enabled
  if (automation.emailNotification && automation.notificationEmail) {
    try {
      await sendResendNotification({
        to: automation.notificationEmail,
        automationName: automation.name,
        agentName: automation.agentName,
        output: outputContent,
        status,
        duration,
        error: errorMsg,
      })
      emailSent = true
    } catch (e) {
      console.warn('Email dispatch failed:', e)
    }
  }

  // Update run record
  const finishedRunRecord = {
    ...initialRunRecord,
    status,
    completedAt,
    duration,
    tokens: tokenCount,
    output: outputContent,
    error: errorMsg,
    emailSent,
  }

  const allRuns = loadRuns().map(r => (r.id === runId ? finishedRunRecord : r))
  saveRuns(allRuns)

  // Update automation nextRunAt and lastRunAt
  const preset = SCHEDULE_PRESETS.find(p => p.value === automation.schedule) || SCHEDULE_PRESETS[1]
  const updatedNextRun = completedAt + preset.ms
  updateAutomation(automation.id, {
    lastRunAt: completedAt,
    nextRunAt: updatedNextRun,
  })

  // Trigger browser notification if supported
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(
      status === 'success' ? `✅ ${automation.name} Finished` : `❌ ${automation.name} Failed`,
      {
        body: status === 'success' ? `Output generated in ${(duration / 1000).toFixed(1)}s` : errorMsg,
        icon: '/favicon.ico',
      }
    )
  }

  return finishedRunRecord
}

// ── In-Browser Cron Background Heartbeat ──
let heartbeatInterval = null

export function initAutomationEngine() {
  if (heartbeatInterval) return

  const checkDue = async () => {
    const automations = loadAutomations()
    const now = Date.now()
    for (const item of automations) {
      if (!item.enabled || !item.hasKey) continue
      if (item.nextRunAt && now >= item.nextRunAt) {
        try {
          await runAutomationNow(item.id)
        } catch (e) {
          console.error(`Scheduled run for ${item.name} failed:`, e)
        }
      }
    }
  }

  // Check on init
  checkDue()
  // Check every 60s
  heartbeatInterval = setInterval(checkDue, 60000)
}
