import { styled } from 'styled-components';

export const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
`;

const bottomRowHeight = 4;

export const BottomRowMessage = styled.h2`
  text-align: center;
  font-size: 2.5rem;
  line-height: ${bottomRowHeight}rem;
`;

export const BottomRow = styled.div`
  margin: 0 auto 0.25rem;
  height: ${bottomRowHeight}rem;
`;
