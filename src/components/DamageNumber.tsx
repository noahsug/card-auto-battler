import { useState } from 'react';
import styled from 'styled-components';

export interface Props {
  value: number;
}

export default function DamageNumber({ value }: Props) {
  const [[xOffset, yOffset]] = useState([Math.random(), Math.random()]);

  return (
    <Root $xOffset={xOffset} $yOffset={yOffset}>
      {value}
    </Root>
  );
}

const Root = styled.div<{ $xOffset: number; $yOffset: number }>`
  position: absolute;
  font-size: 40rem;
  color: darkred;
  font-weight: bold;
  text-shadow: 0 0 1rem black;
  top: 50%;
  left: 0;
  right: 0;
  margin: auto;

  animation: fadeOut 0.75s forwards;
  @keyframes fadeOut {
    80% {
      opacity: 1;
    }
    95% {
      opacity: 0.3;
    }
    100% {
      opacity: 0;
    }
  }

  transform: translate(
    ${({ $xOffset }) => (0.5 - $xOffset) * 100}rem,
    ${({ $yOffset }) => (0.5 - $yOffset) * 100}rem
  );
`;
