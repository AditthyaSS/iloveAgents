// Backup and restore for localStorage app data.
//
// API keys are intentionally excluded. They live in sessionStorage
// through useApiKey and must never end up in a downloadable file.

export const BACKUP_KEYS = [
  'ila_agent_collections',
  'ila_favorites',
  'ila_prompt_history',
  'ila_ratings',
  'ila_analytics',
  'ila_execution_traces',
  'ila_scheduled_jobs',
  'ila_scheduler_results',
  'ila_session_spend',
  'iloveAgents_history',
  'iloveagents_default_provider',
]

export function collectBackup(storage) {
  const source = storage || localStorage
  const data = {}
  for (const key of BACKUP_KEYS) {
    const val = source.getItem(key)
    if (val !== null && val !== undefined) {
      data[key] = val
    }
  }
  return {
    app: 'iloveAgents',
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  }
}

export function validateBackup(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return { ok: false, error: 'Backup file is not valid JSON.' }
  }
  const data = obj.data
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, error: 'Backup file is missing the data section.' }
  }
  const clean = {}
  for (const [key, val] of Object.entries(data)) {
    if (!BACKUP_KEYS.includes(key)) continue
    if (typeof val !== 'string') continue
    clean[key] = val
  }
  if (Object.keys(clean).length === 0) {
    return { ok: false, error: 'No recognized app data found in this file.' }
  }
  return { ok: true, data: clean }
}

export function restoreBackup(cleanData, storage) {
  const target = storage || localStorage
  let count = 0
  for (const [key, val] of Object.entries(cleanData)) {
    if (!BACKUP_KEYS.includes(key)) continue
    if (typeof val !== 'string') continue
    target.setItem(key, val)
    count += 1
  }
  return count
}
