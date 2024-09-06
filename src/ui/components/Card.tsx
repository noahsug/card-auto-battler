import { styled } from 'styled-components';

export default function Card() {
  return <Root>Card</Root>;
}

const Root = styled.div`
  height: 10rem;
  position: relative;
  display: flex;
  border: 0.5em ridge #53b5a8;
  border-width: 0.75rem;
  border-width: 0.5rem;
  image-rendering: -moz-crisp-edges;
  image-rendering: pixelated;
`;
