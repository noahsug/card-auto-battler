import { styled } from 'styled-components';
import { useRef } from 'react';
import gasp from 'gsap';
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
  const cardElements = gasp.utils.toArray<Element>('.card', container.current);
  const animationState = Flip.getState(cardElements);

  useGSAP(
    () => {
      if (!animationState) return;
      Flip.from(animationState, {
        duration: 1,
        ease: 'power3.inOut',
      });
    },
    { scope: container, dependencies: [animationState] },
  );

  return (
    <Root ref={container} $direction={direction === 'left' ? -1 : 1}>
      {cards.map((_, i) => {
        // display cards in reverse order, so the next card is on top (aka at the end)
        const index = (cards.length + currentCardIndex - 1 - i) % cards.length;
        return (
          <Card
            key={index}
            card={cards[index]}
            size="small"
            type="user"
            rotation={getRotation(index)}
          />
        );
      })}
    </Root>
  );
}

const maxGap = 3; // rem
const maxCardsDisplayed = 3;

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
