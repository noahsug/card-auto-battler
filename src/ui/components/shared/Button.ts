import { styled } from 'styled-components';
import { getHandDrawnBorderRadius } from '../../style';

export const Button = styled.button`
  font-size: 2rem;
  margin: 0 auto;
  padding: 0.5rem 0;
  width: 12rem;
  background: none;
  ${getHandDrawnBorderRadius}
  border: solid 0.25rem var(--color-primary);
  font-family: var(--font-heading);
  letter-spacing: 0.1em;
  color: var(--color-primary);
  line-height: 1;
  text-transform: uppercase;
  cursor: pointer;
`;
