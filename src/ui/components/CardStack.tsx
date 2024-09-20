import { styled } from 'styled-components';
import { useEffect, useRef } from 'react';
import { useTransition, animated, config, easings, useSpringRef } from '@react-spring/web';
import random from 'lodash/random';

import type { CardState } from '../../game/gameState';
import Card from './Card';
import useUnits from '../hooks/useUnits';
import { cancelableWait } from '../../utils/wait';

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
  target: Element | null;
  playerType: 'user' | 'enemy';
}

type AnimatedCard = ReturnType<typeof createAnimatedCardState>;

function createAnimatedCardState(card: CardState) {
  return {
    card,
    rotate: random(-10, 10),
    key: card.name + crypto.randomUUID(),
    speedUpAnimation: () => {},
  };
}

function getXYToTarget(self: Element | null, target: Element | null, direction: -1 | 1) {
  if (self == null || target == null) return { x: 0, y: 0 };
  const selfRect = self.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  return {
    x: targetRect.x - selfRect.x + direction * selfRect.width,
    y: targetRect.y - selfRect.y,
  };
}

export default function CardStack({ cards, currentCardIndex, target, playerType }: Props) {
  const [u, windowDimensions] = useUnits();
  const container = useRef<HTMLDivElement>(null);

  const direction = playerType === 'user' ? -1 : 1;

  const animations = useSpringRef();
  const animatedCards = useRef(cards.map(createAnimatedCardState));

  const prevCardIndex = useRef(currentCardIndex);
  const currentCardIndexRef = useRef(currentCardIndex);
  if (currentCardIndexRef.current !== currentCardIndex) {
    prevCardIndex.current = currentCardIndexRef.current;
    currentCardIndexRef.current = currentCardIndex;
  }

  // we're dealing cards if the last card was played or if we've just started
  const isDealingCards =
    currentCardIndex === 0 &&
    (prevCardIndex.current === cards.length - 1 || prevCardIndex.current === 0);

  // reverse card order so the first card is rendered last and displayed on top
  const deck = animatedCards.current.slice(currentCardIndex).reverse();

  function dealCardStartLocation() {
    return { x: windowDimensions.width * direction, y: 0, rotate: 0, scale: 1.5, zIndex: 0 };
  }

  function playCardEndLocation() {
    return {
      x: 0,
      y: u(-1000),
      rotate: 0,
      scale: 1.5,
      zIndex: 1,
    };
  }

  function dealCardAnimation(animatedCard: AnimatedCard, index: number) {
    // stop the current animation (e.g. the card being played)
    animations.current[index]?.stop();

    return {
      x: u(index * -direction),
      y: u(-index),
      rotate: animatedCard.rotate,
      scale: 1,
      delay: isDealingCards ? Math.sqrt(index) * 200 : 0,
      config: config.default,
    };
  }

  function playCardAnimation(animatedCard: AnimatedCard, index: number) {
    animatedCards.current.forEach((card) => card.speedUpAnimation());
    const zIndex = animatedCards.current.length - index;
    animations.current[index]?.set({ zIndex });

    return async (next: (...args: unknown[]) => Promise<void>) => {
      let speedUp = false;
      let cancelWaitFn = () => {};
      animatedCard.speedUpAnimation = () => {
        speedUp = true;
        cancelWaitFn();
      };

      const { x, y } = getXYToTarget(container.current, target, direction);
      await next({ x, y, scale: 1.5, rotate: 0, config: config.stiff });

      if (!speedUp) {
        const [waitPromise, cancelWait] = cancelableWait(500);
        cancelWaitFn = cancelWait;
        await waitPromise;
      }

      await next({
        ...playCardEndLocation(),
        config: { duration: 300, easing: easings.easeInBack },
      });
    };
  }

  const transitions = useTransition(deck, {
    key: ({ key }: AnimatedCard) => key,
    from: isDealingCards ? dealCardStartLocation : playCardEndLocation,
    enter: dealCardAnimation,
    leave: playCardAnimation,
    ref: animations,
  });

  useEffect(() => {
    animations.start();
  }, [animations, currentCardIndex]);

  const cardColor = playerType === 'user' ? 'regular' : 'red';

  return (
    <div>
      <StackedCardsContainer ref={container}>
        {transitions((style, { card }) => (
          <AnimatedContainer style={style}>
            <Card card={card} size="medium" color={cardColor} />
          </AnimatedContainer>
        ))}
      </StackedCardsContainer>
    </div>
  );
}
