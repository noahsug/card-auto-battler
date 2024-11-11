import { useEffect, useRef } from 'react';

interface Options {
  enabled?: boolean;
}

export function useTimeout(callback: () => void, ms: number, options: Options = {}) {
  const timeoutInfo = useRef<{
    timeoutStart: number;
    timeout: NodeJS.Timeout;
    done: boolean;
  }>();

  useEffect(() => {
    if (!options.enabled) {
      if (timeoutInfo.current) {
        clearTimeout(timeoutInfo.current.timeout);
        timeoutInfo.current = undefined;
      }
      return;
    }

    if (timeoutInfo.current?.done) return;

    // calculate elapsed time to continue the timeout, e.g. if the callback function changed
    let elapsed = 0;
    if (timeoutInfo.current) {
      clearTimeout(timeoutInfo.current.timeout);
      elapsed = Date.now() - timeoutInfo.current.timeoutStart;
    }

    const timeout = setTimeout(() => {
      timeoutInfo.current!.done = true;
      callback();
    }, ms - elapsed);

    timeoutInfo.current = { timeoutStart: Date.now(), timeout, done: false };

    return () => clearTimeout(timeout);
  }, [callback, ms, options.enabled]);
}
