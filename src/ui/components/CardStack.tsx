import { css, styled } from 'styled-components';

import type { CardState } from '../../game/gameState';
import Card, { CardRoot } from './Card';

interface Props {
  cards: CardState[];
  currentCardIndex: number;
  direction: 'left' | 'right';
}

const maxRotation = 1 / 33;
const rotations = new Array(20)
  .fill(0)
  .map((_, i) => Math.random() * 2 * maxRotation - maxRotation);
function getRotation(index: number) {
  return rotations[index % rotations.length];
}

export default function CardStack({ cards, currentCardIndex, direction }: Props) {
  cards = cards.slice(currentCardIndex).concat(cards.slice(0, currentCardIndex)).reverse();

  return (
    <Root direction={direction === 'left' ? -1 : 1}>
      {cards.map((card, i) => {
        const index = (currentCardIndex + cards.length - i) % cards.length;
        return (
          <Card key={index} card={card} size="small" type="user" rotation={getRotation(index)} />
        );
      })}
    </Root>
  );
}

const maxGap = 10;
const maxCardsDisplayed = 10;

function getOffset(i: number) {
  const displayNumber = Math.min(i, maxCardsDisplayed);
  const ratio = Math.sin((Math.PI / 2) * (displayNumber / maxCardsDisplayed));
  return maxGap * ratio;
}

function getCardGaps({ direction }: { direction: number }) {
  const gaps = [];
  for (let i = 0; i < maxCardsDisplayed - 1; i++) {
    const offset = getOffset(i) * direction;
    gaps.push(`
      &:nth-last-child(${i + 1}) {
        left: ${offset}rem;
      }
    `);
  }
  return gaps.join('\n');
}

const Root = styled.div<{ direction: number }>`
  position: relative;

  ${CardRoot} {
    position: absolute;
    left: ${(props) => maxGap * props.direction}rem;

    ${getCardGaps}
  }
`;
