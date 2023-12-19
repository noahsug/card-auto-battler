import { useEffect, useState } from 'react';

const useWait = () => {
  const [waitMs, setWaitMs] = useState(-1);

  useEffect(() => {
    if (waitMs < 0) return;
    const timeout = setTimeout(() => {
      setWaitMs(0);
    }, waitMs);

    return () => clearTimeout(timeout);
  }, [waitMs]);

  function wait(waitMs: number) {
    setWaitMs(waitMs);
  }

  function isWaiting() {
    return waitMs > 0;
  }

  return { wait, isWaiting };
};

export default useWait;
