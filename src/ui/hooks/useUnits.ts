import { useCallback, useEffect, useState } from 'react';

export type UnitFn = (value: number) => number;
export type WindowDimensions = { width: number; height: number };

export function useUnits() {
  const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const unit: UnitFn = useCallback(
    (value: number) => (value * windowDimensions.height) / 500,
    [windowDimensions],
  );

  return [unit, windowDimensions] as const;
}
