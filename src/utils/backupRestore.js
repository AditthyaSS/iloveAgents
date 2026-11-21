// src/utils/backupStorage.js

const ALLOWED_EXPORT_KEYS = [
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
];

/**
 * Collects allowed keys from localStorage and triggers a JSON file download.
 */
export function exportAppData() {
  try {
    const backupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {},
    };

    for (const key of ALLOWED_EXPORT_KEYS) {
      const value = localStorage.getItem(key);
      if (value !== null) {
        try {
          // Parse JSON if possible so the export file is clean and structured
          backupData.data[key] = JSON.parse(value);
        } catch {
          // Fallback to raw string if not valid JSON
          backupData.data[key] = value;
        }
      }
    }

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `iloveagents-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (err) {
    console.error('[Backup] Export failed:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Validates and restores app data from an uploaded backup JSON object.
 */
export function importAppData(fileContent) {
  try {
    const parsed = JSON.parse(fileContent);

    if (!parsed || typeof parsed !== 'object' || !parsed.data) {
      return { success: false, error: 'Invalid backup file structure: missing data payload.' };
    }

    const importedData = parsed.data;
    let restoredCount = 0;

    for (const [key, value] of Object.entries(importedData)) {
      // Strictly enforce whitelist check to prevent arbitrary key injection
      if (ALLOWED_EXPORT_KEYS.includes(key)) {
        const stringifiedValue = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, stringifiedValue);
        restoredCount++;
      }
    }

    if (restoredCount === 0) {
      return { success: false, error: 'No valid application keys found in the uploaded file.' };
    }

    return { success: true, restoredCount };
  } catch (err) {
    console.error('[Backup] Import failed:', err);
    return { success: false, error: 'Failed to parse JSON backup file. Ensure it is valid.' };
  }
}
