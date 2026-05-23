import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook to manage agent execution history in localStorage.
 * Stores up to 10 most recent runs.
 */
export const useHistory = () => {
  const STORAGE_KEY = 'iloveAgents_history';
  const MAX_HISTORY = 10;

  // Initialize state from localStorage
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading history from localStorage:', error);
      return [];
    }
  });

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded. History might be truncated.');
      } else {
        console.error('Error saving history to localStorage:', error);
      }
    }
  }, [history]);

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

    setHistory((prevHistory) => {
      // Add to beginning of array
      const updatedHistory = [newRun, ...prevHistory];
      // Keep only the last 10
      return updatedHistory.slice(0, MAX_HISTORY);
    });
  }, []);

  /**
   * Delete a specific run from history.
   * @param {string} runId - The unique ID of the run to delete.
   */
  const deleteRun = useCallback((runId) => {
    setHistory((prevHistory) => prevHistory.filter((run) => run.id !== runId));
  }, []);

  /**
   * Clear all history from state and localStorage.
   */
  const clearHistory = useCallback(() => {
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
