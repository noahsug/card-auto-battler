import { styled } from 'styled-components';
import { getHandDrawnBorderRadius } from '../../style';

export default styled.button`
  font-size: 3rem;
  margin: 0.5em auto;
  padding: 0.5rem 0 1rem;
  width: 14rem;
  background: none;
  ${getHandDrawnBorderRadius}
  border: solid 0.5rem var(--color-primary);
  font-family: var(--font-heading);
  letter-spacing: 0.1em;
  color: var(--color-primary);
  line-height: 1;
  text-transform: uppercase;
`;
