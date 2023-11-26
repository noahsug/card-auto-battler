import { useEffect, useRef } from 'react';

import { useActions } from './GameContext';

const ACTION_KEY = ' ';

const BUFFER_MS = 100;

export default function InputTracker() {
  const actionKeyUpTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { actionKeyDown, actionKeyUp } = useActions();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== ACTION_KEY) return;
      actionKeyDown();
      clearTimeout(actionKeyUpTimeout.current);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key !== ACTION_KEY) return;
      clearTimeout(actionKeyUpTimeout.current);
      actionKeyUpTimeout.current = setTimeout(actionKeyUp, BUFFER_MS);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearTimeout(actionKeyUpTimeout.current);
    };
  }, []);

  return null;
}
