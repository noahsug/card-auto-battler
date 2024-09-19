import { styled } from 'styled-components';
import { useEffect, useRef } from 'react';
import { useTransition, animated, config, easings } from '@react-spring/web';
import random from 'lodash/random';

import type { CardState } from '../../game/gameState';
import Card from './Card';
import useUnits from '../hooks/useUnits';
import wait from '../../utils/wait';

const StackedCardsContainer = styled.div`
  position: relative;

  /* matches Card width/height */
  height: ${20 * 0.8}rem;
  width: ${12 * 0.8}rem;
`;

const AnimatedContainer = styled(animated.div)`
  position: absolute;
  inset: 0;
`;

interface Props {
  cards: CardState[];
  currentCardIndex: number;
}

interface AnimatedCard {
  card: CardState;
  rotate: number;
  animation: 'dealCard' | 'inDeck' | 'playCard';
  key: string;
}

// reverse card order so the first card is rendered last and displayed on top
// const getDeck = () => animatedCards.current.slice(currentCardIndex).reverse();
// const deck = useRef(getDeck());

// const discard = useRef<AnimatedCard[]>([]);
// function getDiscard(cards: CardState[], currentCardIndex: number, animatedCards: AnimatedCard[]) {
//   return animatedCards.slice(0, currentCardIndex);
// }

// useEffect(() => {
//   deck.current = getDeck();
//   // eslint-disable-next-line react-hooks/exhaustive-deps
// }, [cards, currentCardIndex]);

function createAnimatedCardState(card: CardState): AnimatedCard {
  return {
    card,
    rotate: random(-10, 10),
    animation: 'inDeck',
    key: card.name + crypto.randomUUID(),
  };
}

export default function CardStack({ cards, currentCardIndex }: Props) {
  const [u, windowDimensions] = useUnits();

  const animatedCards = useRef(cards.map(createAnimatedCardState));

  // reverse card order so the first card is rendered last and displayed on top
  const deck = animatedCards.current.slice(currentCardIndex).reverse();

  function dealCardAnimation(animatedCard: AnimatedCard, index: number) {
    return {
      x: u(index),
      y: u(-index),
      rotate: animatedCard.rotate,
      scale: 1,
      delay: Math.sqrt(index) * 200,
    };
  }

  function playCardAnimation() {
    return async (next: (...args: unknown[]) => Promise<void>) => {
      await next({ x: u(200), scale: 2, rotate: 0 });
      await wait(500);
      await next({
        y: u(-1000),
        config: { duration: 300, easing: easings.easeInBack },
      });
    };
  }

  const transitions = useTransition(deck, {
    key: ({ key }: AnimatedCard) => key,
    from: { x: -windowDimensions.width, y: 0, rotate: 0, scale: 1.5 },
    enter: dealCardAnimation,
    leave: playCardAnimation,
  });

  return (
    <div>
      <StackedCardsContainer>
        {transitions((style, { card }) => (
          <AnimatedContainer style={style}>
            <Card card={card} size="medium" type="user" />
          </AnimatedContainer>
        ))}
      </StackedCardsContainer>
    </div>
  );
}
