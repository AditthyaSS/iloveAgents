// src/lib/useAgentFormPersistence.js
import { useState, useEffect, useCallback } from "react";

const STORAGE_PREFIX = "iloveagents_draft_";

/**
 * Persists agent form field values to localStorage, keyed by agent ID.
 * Automatically restores on mount and saves on every change.
 *
 * @param {string} agentId  - The agent's unique ID from registry.js
 * @param {Array}  inputs   - The agent's inputs config array
 * @returns {{ values, setField, resetToDefaults, hasDraft, draftSavedAt }}
 */
export function useAgentFormPersistence(agentId, inputs) {
  const storageKey = `${STORAGE_PREFIX}${agentId}`;

  // Build default values from the inputs config
  const getDefaults = useCallback(() => {
    const defaults = {};
    (inputs || []).forEach((input) => {
      if (input.defaultValue !== undefined) {
        defaults[input.id] = input.defaultValue;
      } else if (input.type === "multiselect") {
        defaults[input.id] = [];
      } else {
        defaults[input.id] = "";
      }
    });
    return defaults;
  }, [inputs]);

  // Initialize from localStorage if a draft exists, otherwise use defaults
  const [values, setValues] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const { fields } = JSON.parse(saved);
        return { ...getDefaults(), ...fields };
      }
    } catch (_) {}
    return getDefaults();
  });

  const [draftSavedAt, setDraftSavedAt] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved).savedAt;
    } catch (_) {}
    return null;
  });

  // Auto-save to localStorage whenever values change
  useEffect(() => {
    const hasContent = Object.values(values).some((v) =>
      Array.isArray(v) ? v.length > 0 : v && v.trim() !== ""
    );

    if (!hasContent) {
      // Nothing worth saving — clean up any stale draft
      localStorage.removeItem(storageKey);
      setDraftSavedAt(null);
      return;
    }

    try {
      const savedAt = new Date().toISOString();
      localStorage.setItem(
        storageKey,
        JSON.stringify({ fields: values, savedAt })
      );
      setDraftSavedAt(savedAt);
    } catch (_) {}
  }, [values, storageKey]);

  // Update a single field by ID
  const setField = useCallback((id, value) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  // Reset all fields to defaults and clear the saved draft
  const resetToDefaults = useCallback(() => {
    setValues(getDefaults());
    localStorage.removeItem(storageKey);
    setDraftSavedAt(null);
  }, [storageKey, getDefaults]);

  const hasDraft = draftSavedAt !== null;

  return { values, setField, resetToDefaults, hasDraft, draftSavedAt };
}