import { useEffect, useRef } from 'react';

/**
 * A hook to handle keyboard shortcuts globally or within a component.
 * @param {Object} shortcuts - An object where keys are shortcut descriptions (e.g., 'Control+Enter', 'Escape', '/') 
 *                             and values are callback functions.
 */
export const useKeyboardShortcuts = (shortcuts) => {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    const handleKeyDown = (event) => {
      const currentShortcuts = shortcutsRef.current;
      if (!currentShortcuts) return;

      const hasModifier = Boolean(event.ctrlKey || event.metaKey || event.altKey);
      const keys = [];
      if (event.ctrlKey || event.metaKey) keys.push('Control');
      if (event.altKey) keys.push('Alt');
      if (event.shiftKey) keys.push('Shift');
      
      // Don't add if it's just a modifier key
      if (!['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
        keys.push(event.key === ' ' ? 'Space' : event.key);
      }

      const shortcutStr = keys.join('+');
      const singleKey = event.key;
      const isEscape = singleKey === 'Escape' || singleKey === 'Esc';

      const isInput =
        Boolean(event.target) &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName) ||
          Boolean(event.target.isContentEditable));

      // Resolve handler
      let handler = currentShortcuts[shortcutStr];

      // Support 'Ctrl' alias for 'Control' (e.g. 'Ctrl+Enter')
      if (!handler && shortcutStr.includes('Control')) {
        const ctrlStr = shortcutStr.replace('Control', 'Ctrl');
        handler = currentShortcuts[ctrlStr];
      }

      // Support 'Esc' / 'Escape' aliases
      if (!handler && isEscape) {
        if (!hasModifier) {
          handler = currentShortcuts['Escape'] || currentShortcuts['Esc'];
        } else {
          const altStr = shortcutStr.includes('Escape')
            ? shortcutStr.replace('Escape', 'Esc')
            : shortcutStr.replace('Esc', 'Escape');
          handler = currentShortcuts[altStr];
        }
      }

      if (!handler && !hasModifier) {
        handler = currentShortcuts[singleKey];
        if (!handler && isEscape) {
          handler = currentShortcuts['Escape'] || currentShortcuts['Esc'];
        }
      }

      if (!handler) return;

      // Single printable keys without modifiers (e.g., '/', '?') should not trigger if typing in an input/textarea.
      // Escape and modifier combinations (e.g., Ctrl+Enter) are allowed to trigger inside inputs.
      if (isInput && !hasModifier && !isEscape) {
        return;
      }

      handler(event);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
