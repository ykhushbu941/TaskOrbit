import { useEffect } from 'react';

export const useKeyboardShortcuts = (shortcuts: { [key: string]: () => void }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (shortcuts[key] && !['input', 'textarea'].includes((event.target as HTMLElement).tagName.toLowerCase())) {
        event.preventDefault();
        shortcuts[key]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};
