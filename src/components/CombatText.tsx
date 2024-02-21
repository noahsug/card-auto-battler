import { useState } from 'react';
import styled from 'styled-components';
import { AnimationEvent } from '../gameState/gameState';

export type Props = Omit<AnimationEvent, 'target'>;

export default function CombatText({ value, type }: Props) {
  const [[xOffset, yOffset]] = useState([Math.random(), Math.random()]);

  // "miss" or damage/heal number
  const text = value || type;

  return (
    <Root $xOffset={xOffset} $yOffset={yOffset} $type={type}>
      {text}
    </Root>
  );
}

const Root = styled.div<{ $xOffset: number; $yOffset: number; $type: Props['type'] }>`
  position: absolute;
  font-size: 40rem;
  color: ${({ $type }) => ($type === 'damage' ? 'darkred' : 'darkgreen')};
  font-weight: bold;
  text-shadow: 0 0 1rem black;
  top: 50%;
  left: 0;
  right: 0;
  margin: auto;

  animation: fadeOut 1s forwards;
  @keyframes fadeOut {
    70% {
      opacity: 1;
    }
    90% {
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
