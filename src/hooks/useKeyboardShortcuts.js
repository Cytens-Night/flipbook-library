import { useEffect } from 'react';

/**
 * Custom hook for global keyboard shortcuts
 * @param {Object} shortcuts - Map of key combinations to handlers
 * @param {boolean} enabled - Whether shortcuts are enabled
 */
export const useKeyboardShortcuts = (shortcuts, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const ctrl = event.ctrlKey || event.metaKey;
      const shift = event.shiftKey;
      const alt = event.altKey;

      // Build key combination string
      let combo = '';
      if (ctrl) combo += 'ctrl+';
      if (shift) combo += 'shift+';
      if (alt) combo += 'alt+';
      combo += key;

      // Check for exact key match (no modifiers)
      if (!ctrl && !shift && !alt && shortcuts[key]) {
        event.preventDefault();
        shortcuts[key]();
        return;
      }

      // Check for key combo match
      if (shortcuts[combo]) {
        event.preventDefault();
        shortcuts[combo]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
};

/**
 * Common keyboard shortcuts for the library
 */
export const SHORTCUTS = {
  // Navigation
  SEARCH: 'ctrl+f',
  CLOSE: 'escape',
  
  // Reading
  NEXT_PAGE: 'arrowright',
  PREV_PAGE: 'arrowleft',
  BOOKMARK: 'ctrl+b',
  NIGHT_MODE: 'ctrl+n',
  FONT_UP: 'ctrl+=',
  FONT_DOWN: 'ctrl+-',
  
  // Library
  UPLOAD: 'ctrl+u',
  SETTINGS: 'ctrl+,',
  DELETE: 'delete',
  
  // Groups
  CREATE_GROUP: 'ctrl+g',
  RENAME: 'f2',
};

export default useKeyboardShortcuts;
