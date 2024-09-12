import { css, styled } from 'styled-components';
import { useRef } from 'react';
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';

import type { CardState } from '../../game/gameState';
import Card, { CardRoot } from './Card';

interface Props {
  cards: CardState[];
  currentCardIndex: number;
  direction: 'left' | 'right';
}

const maxRotation = 1 / 33; // in turns
// store random rotations for each card, the same card will always have the same rotation
const rotations = new Array(20).fill(0).map(() => Math.random() * 2 * maxRotation - maxRotation);
function getRotation(index: number) {
  return rotations[index % rotations.length];
}

export default function CardStack({ cards, currentCardIndex, direction }: Props) {
  const container = useRef(null);
  const animationStates = useRef<Flip.FlipState>();
  const animate = useRef(true);

  useGSAP(
    () => {
      if (!animate.current) return;

      if (animationStates.current) {
        Flip.from(animationStates.current, {
          duration: 5,
          ease: 'power3.inOut',
          absolute: true,
        });
        animate.current = false;
      }
      animationStates.current = Flip.getState('.card');
    },
    { dependencies: [cards, currentCardIndex, direction], scope: container },
  );

  cards = cards.slice(currentCardIndex).concat(cards.slice(0, currentCardIndex)).reverse();

  return (
    <Root ref={container} $direction={direction === 'left' ? -1 : 1}>
      {cards.map((card, i) => {
        const index = (currentCardIndex + cards.length - i) % cards.length;
        return (
          <Card key={index} card={card} size="small" type="user" rotation={getRotation(index)} />
        );
      })}
    </Root>
  );
}

const maxGap = 3;
const maxCardsDisplayed = 10;

function getOffset(i: number) {
  const displayNumber = Math.min(i, maxCardsDisplayed);
  const ratio = Math.sin((Math.PI / 2) * (displayNumber / maxCardsDisplayed));
  return maxGap * ratio;
}

function getCardGaps({ $direction }: { $direction: number }) {
  const gaps = [];
  for (let i = 0; i < maxCardsDisplayed - 1; i++) {
    const offset = getOffset(i) * $direction;
    gaps.push(`
      &:nth-last-child(${i + 1}) {
        left: ${offset}rem;
      }
    `);
  }
  return gaps.join('\n');
}

const Root = styled.div<{ $direction: number }>`
  position: relative;

  /* matches Card width/height */
  height: ${20 * 0.8}rem;
  width: ${12 * 0.8}rem;

  ${CardRoot} {
    position: absolute;
    left: ${(props) => maxGap * props.$direction}rem;

    ${getCardGaps}
  }
`;
