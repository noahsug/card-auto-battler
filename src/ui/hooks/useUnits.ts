import { useCallback, useEffect, useState } from 'react';

export type UnitFn = (value: number) => number;

export function useUnits() {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const unit: UnitFn = useCallback(
    (value: number) => (value * dimensions.height) / 500,
    [dimensions],
  );

  return [unit, dimensions] as const;
}
