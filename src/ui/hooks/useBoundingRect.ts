import { useCallback, useRef, useState } from 'react';

// returns bounding client rect that keeps the same object ref to avoid unnecessarily re-renders
export function useGetBoundingRect() {
  const [element, setElement] = useState<Element | null>(null);
  const rect = useRef<DOMRect | null>(null);

  const handleRef = useCallback(
    (newElement: Element | null) => {
      if (!element && newElement) {
        setElement(newElement);
      }
    },
    [element],
  );

  const getBoundingRect = useCallback(() => {
    if (!element) return null;

    const newRect = element.getBoundingClientRect();
    if (
      !rect.current ||
      rect.current.width !== newRect.width ||
      rect.current.height !== newRect.height ||
      rect.current.x !== newRect.x ||
      rect.current.y !== newRect.y
    ) {
      rect.current = newRect;
    }
    return rect.current;
  }, [element]);

  return [handleRef, getBoundingRect] as const;
}
