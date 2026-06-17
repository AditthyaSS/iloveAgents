import { useEffect } from 'react';

/**
 * A hook to handle keyboard shortcuts globally or within a component.
 * @param {Object} shortcuts - An object where keys are shortcut descriptions (e.g., 'Control+Enter') 
 *                             and values are callback functions.
 */
export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const keys = [];
      if (event.ctrlKey || event.metaKey) keys.push('Control');
      if (event.altKey) keys.push('Alt');
      if (event.shiftKey) keys.push('Shift');
      
      // Don't add if it's just a modifier key
      if (!['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
        keys.push(event.key === ' ' ? 'Space' : event.key);
      }

      const shortcutStr = keys.join('+');
      
      // Also support single keys like '/' or '?'
      const singleKey = event.key;

      if (shortcuts[shortcutStr]) {
        shortcuts[shortcutStr](event);
      } else if (shortcuts[singleKey] && !['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
        // For single keys like '/' or '?', we usually don't want them to fire if we are typing in an input
        shortcuts[singleKey](event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};
