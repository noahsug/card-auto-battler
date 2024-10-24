import { useEffect, useRef } from 'react';

interface Options {
  stop?: boolean;
}

export function useTimeout(callback: () => void, ms: number, options: Options = {}) {
  const timeoutInfo = useRef<{ timeoutStart: number; timeout: NodeJS.Timeout }>();

  useEffect(() => {
    if (options.stop) {
      if (timeoutInfo.current) {
        clearTimeout(timeoutInfo.current.timeout);
        timeoutInfo.current = undefined;
      }
      return;
    }

    let elapsed = 0;
    if (timeoutInfo.current) {
      clearTimeout(timeoutInfo.current.timeout);
      elapsed = Date.now() - timeoutInfo.current.timeoutStart;
    }

    const timeout = setTimeout(() => {
      timeoutInfo.current = undefined;
      callback();
    }, ms - elapsed);

    timeoutInfo.current = { timeoutStart: Date.now(), timeout };

    return () => clearTimeout(timeout);
  }, [callback, ms, options.stop]);
}
