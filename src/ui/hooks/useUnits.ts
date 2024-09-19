import { useEffect, useState } from 'react';

export default function useUnits() {
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

  function unit(value: number) {
    return (value * dimensions.height) / 500;
  }

  return [unit, dimensions] as const;
}
