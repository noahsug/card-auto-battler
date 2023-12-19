import { useState, useEffect, useRef } from 'react';

export default function useSequencer(actions) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRunningAction, setIsRunningAction] = useState(false);

  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  useEffect(() => {
    (async () => {
      if (actionsRef.current.length === 0) return;
      if (isRunningAction) return;

      if (currentIndex > actionsRef.current.length) {
        setCurrentIndex(0);
        return;
      }

      setIsRunningAction(true);
      await actionsRef.current[currentIndex]();

      setCurrentIndex((currentIndex + 1) % actionsRef.current.length);
      setIsRunningAction(false);
    })();
  }, [currentIndex, isRunningAction]);
}
