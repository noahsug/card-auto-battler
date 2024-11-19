import { styled } from 'styled-components';
import { useUnits } from '../hooks/useUnits';
import { useMemo } from 'react';

export const CardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  overflow-y: auto;

  > * {
    margin: 0.25rem;
  }
`;

export function useCardSize() {
  const [, windowDimensions] = useUnits();
  return useMemo(
    () => (windowDimensions.width >= windowDimensions.height ? 'large' : 'small'),
    [windowDimensions.height, windowDimensions.width],
  );
}

const bottomRowHeight = 4;

export const Message = styled.h2`
  text-align: center;
  font-size: 2.5rem;
  line-height: ${bottomRowHeight}rem;
`;

export const BottomRow = styled.div`
  margin: 0 auto 0.25rem;
  height: ${bottomRowHeight}rem;
`;
