import { useState, useEffect, useRef } from 'react';

export default function useSequencer(actions: Array<() => unknown>) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const isRunningAction = useRef(false);
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  useEffect(() => {
    (async () => {
      if (actionsRef.current.length === 0) return;
      if (isRunningAction.current) return;

      if (currentIndex > actionsRef.current.length) {
        setCurrentIndex(0);
        return;
      }

      isRunningAction.current = true;
      await actionsRef.current[currentIndex]();

      setCurrentIndex((currentIndex + 1) % actionsRef.current.length);
      isRunningAction.current = false;
    })();
  }, [currentIndex]);
}
