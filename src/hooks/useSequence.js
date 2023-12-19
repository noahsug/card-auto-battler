import { useState, useEffect } from 'react';
import { act } from 'react-dom/test-utils';

export default function useSequencer(actions) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRunningAction, setIsRunningAction] = useState(false);

  useEffect(() => {
    let isFinished = false;

    (async () => {
      if (actions.length === 0) return;
      if (isRunningAction) return;

      if (currentIndex > actions.length) {
        setCurrentIndex(0);
        return;
      }

      setIsRunningAction(true);
      console.log('running', currentIndex);
      await actions[currentIndex]();
      // if (isFinished) return;

      setCurrentIndex((currentIndex + 1) % actions.length);
      setIsRunningAction(false);
    })();

    return () => {
      console.log('cleanup');
      isFinished = true;
    };
  }, [currentIndex, actions, isRunningAction]);
}
