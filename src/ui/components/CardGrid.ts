import { styled } from 'styled-components';
import { useUnits } from '../hooks/useUnits';
import { useMemo } from 'react';

export const CardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  overflow-y: auto;
`;

export function useCardSize() {
  const [, windowDimensions] = useUnits();
  return useMemo(
    () => (windowDimensions.width >= windowDimensions.height ? 'large' : 'small'),
    [windowDimensions.height, windowDimensions.width],
  );
}
