import { useState, useCallback, useEffect } from 'react';

export const STORAGE_KEY = 'iloveAgents_history';
export const MAX_HISTORY = 10;

export function loadHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading history from localStorage:', error);
    return [];
  }
}

export function saveHistory(history) {
  let current = Array.isArray(history) ? [...history] : [];
  while (current.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      return current;
    } catch (error) {
      const isQuotaExceeded =
        error?.name === 'QuotaExceededError' ||
        error?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        error?.code === 22 ||
        error?.code === 1014;

      if (isQuotaExceeded && current.length > 1) {
        console.warn('LocalStorage quota exceeded. Pruning oldest history entry to recover space.');
        current.pop();
      } else {
        console.error('Error saving history to localStorage:', error);
        return current;
      }
    }
  }
  return current;
}

/**
 * Custom hook to manage agent execution history in localStorage.
 * Stores up to 10 most recent runs.
 *
 * Writes are computed against the freshest localStorage value (re-read at
 * write time) rather than only the in-memory React state, and this tab's
 * state is resynced whenever another tab writes to the same key. Without
 * this, two tabs (or two updates racing close together) each compute a
 * new value from their own possibly-stale in-memory copy and the last
 * write silently overwrites the other's runs.
 */
export const useHistory = () => {
  const [history, setHistory] = useState(() => loadHistory());

  // Pick up writes made by other tabs/windows to the same key.
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        setHistory(loadHistory());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  /**
   * Save a new run to history.
   * Maintains a maximum of 10 runs, removing the oldest if necessary.
   * @param {Object} run - The run data (agentId, agentName, inputs, output, provider)
   */
  const saveRun = useCallback((run) => {
    const timestamp = Date.now();
    const newRun = {
      ...run,
      id: `${run.agentId}_${timestamp}`,
      timestamp,
    };

    // Merge against the current on-disk value, not stale in-memory state,
    // so a concurrent write (another tab, or a near-simultaneous call)
    // isn't silently discarded.
    const updatedHistory = [newRun, ...loadHistory()].slice(0, MAX_HISTORY);
    const saved = saveHistory(updatedHistory);
    setHistory(saved);
  }, []);

  /**
   * Delete a specific run from history.
   * @param {string} runId - The unique ID of the run to delete.
   */
  const deleteRun = useCallback((runId) => {
    const updatedHistory = loadHistory().filter((run) => run.id !== runId);
    const saved = saveHistory(updatedHistory);
    setHistory(saved);
  }, []);

  /**
   * Clear all history from state and localStorage.
   */
  const clearHistory = useCallback(() => {
    saveHistory([]);
    setHistory([]);
  }, []);

  /**
   * Get the current history (optional wrapper, history state is already returned).
   */
  const getHistory = useCallback(() => history, [history]);

  return {
    history,
    saveRun,
    deleteRun,
    clearHistory,
    getHistory,
  };
};

export default useHistory;
