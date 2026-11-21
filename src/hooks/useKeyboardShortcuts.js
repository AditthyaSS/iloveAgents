
import { useEffect, useRef } from "react";

/**
 * Custom React hook for handling keyboard shortcuts.
 *
 * @param {Object} shortcuts - Keyboard shortcuts and callbacks.
 * @param {Object} options - Configuration options.
 *
 * Example:
 * useKeyboardShortcuts({
 *   "Control+Enter": handleSubmit,
 *   "Escape": handleClose,
 *   "/": handleSearch
 * });
 */

const normalizeKey = (key) => {
  const aliases = {
    " ": "Space",
    "Esc": "Escape",
    "Del": "Delete",
    "Left": "ArrowLeft",
    "Right": "ArrowRight",
    "Up": "ArrowUp",
    "Down": "ArrowDown"
  };

  return aliases[key] || key;
};

const isTypingElement = (target) => {
  if (!target) return false;

  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
};

const getShortcutString = (event) => {
  const keys = [];

  if (event.ctrlKey || event.metaKey) keys.push("Control");
  if (event.altKey) keys.push("Alt");
  if (event.shiftKey) keys.push("Shift");

  const key = normalizeKey(event.key);

  if (!["Control", "Alt", "Shift", "Meta"].includes(key)) {
    keys.push(key);
  }

  return keys.join("+");
};

export const useKeyboardShortcuts = (
  shortcuts,
  {
    enabled = true,
    preventDefault = true,
    enableInInputs = false
  } = {}
) => {
  const shortcutsRef = useRef(shortcuts);

  // Keep callbacks updated without re-registering listeners.
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      const shortcutMap = shortcutsRef.current || {};

      const shortcut = getShortcutString(event);
      const singleKey = normalizeKey(event.key);

      const isTyping = isTypingElement(event.target);

      let callback = shortcutMap[shortcut];

      // Single-key shortcuts are ignored while typing by default.
      if (
        !callback &&
        (!isTyping || enableInInputs)
      ) {
        callback = shortcutMap[singleKey];
      }

      if (typeof callback !== "function") return;

      if (preventDefault) {
        event.preventDefault();
      }

      callback(event);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, preventDefault, enableInInputs]);
};
