import { styled } from 'styled-components';

export default styled.button`
  font-size: 3.5rem;
  margin: 0.5em auto;
  padding: 0.5rem 0 1rem;
  width: 16rem;
  background: transparent;
  border-top-left-radius: 255px 15px;
  border-top-right-radius: 15px 225px;
  border-bottom-right-radius: 225px 15px;
  border-bottom-left-radius: 15px 255px;
  border-width: 0.5rem;
  font-family: var(--font-heading);
  letter-spacing: 0.1em;
  color: var(--color-primary);
  border-color: var(--color-primary);
  line-height: 1;
`;
