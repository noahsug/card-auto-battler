import random from 'lodash/random';
import { useRef, useEffect } from 'react';

import { CardState } from '../../../game/gameState';
import useUnits from '../../hooks/useUnits';
import { useSpringRef, useTransition, config, easings } from '@react-spring/web';
import { cancelableWait } from '../../../utils/wait';

export interface Props {
  cards: CardState[];
  currentCardIndex: number;
  selfElement: Element | null;
  targetElement: Element | null;
  cardDealDirection: -1 | 1;
  turn: number;
}

function useIsDealingCards(currentCardIndex: number, cardsLength: number) {
  const prevCardIndex = useRef(currentCardIndex);
  const currentCardIndexRef = useRef(currentCardIndex);

  if (currentCardIndexRef.current !== currentCardIndex) {
    prevCardIndex.current = currentCardIndexRef.current;
    currentCardIndexRef.current = currentCardIndex;
  }

  // we're dealing cards if the last card was played or if we've just started
  return (
    currentCardIndex === 0 &&
    (prevCardIndex.current === cardsLength - 1 || prevCardIndex.current === 0)
  );
}

type CardAnimation = ReturnType<typeof createCardAnimation>;

function createCardAnimation(card: CardState) {
  return {
    card,
    rotate: random(-10, 10),
    key: card.name + crypto.randomUUID(),
    speedUpAnimation: () => {},
  };
}

export function useCardStackAnimation({
  cards,
  currentCardIndex,
  selfElement,
  targetElement,
  cardDealDirection,
  turn,
}: Props) {
  const [u, windowDimensions] = useUnits();
  const isDealingCards = useIsDealingCards(currentCardIndex, cards.length);
  const animationController = useSpringRef();
  const cardAnimationsRef = useRef(cards.map(createCardAnimation));

  // reverse card order so the first card is rendered last and displayed on top
  const deck = cardAnimationsRef.current.slice(currentCardIndex).reverse();

  function speedUpAnimation() {
    cardAnimationsRef.current.forEach((card) => card.speedUpAnimation());
  }

  useEffect(() => {
    speedUpAnimation();
  }, [turn]);

  function dealCardStart() {
    return {
      x: windowDimensions.width * -cardDealDirection,
      y: 0,
      rotate: 0,
      scale: 1.5,
      zIndex: 0,
    };
  }

  function playCardEnd() {
    return {
      y: u(-1000),
      rotate: 0,
      zIndex: 1,
    };
  }

  function dealCard(animatedCard: CardAnimation, index: number) {
    // stop the current animation (e.g. the card being played)
    animationController.current[index]?.stop();

    return {
      x: u(index * cardDealDirection),
      y: u(-index),
      rotate: animatedCard.rotate,
      scale: 1,
      delay: isDealingCards ? Math.sqrt(index) * 200 : 0,
      config: config.default,
    };
  }

  function getXYToTarget() {
    if (selfElement == null || targetElement == null) return { x: 0, y: 0 };

    const selfRect = selfElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    const xOffset = cardDealDirection === 1 ? -selfRect.width : targetRect.width;
    return {
      x: targetRect.x - selfRect.x + xOffset,
      y: targetRect.y - selfRect.y,
    };
  }

  function playCard(animatedCard: CardAnimation, index: number) {
    speedUpAnimation();

    const zIndex = cardAnimationsRef.current.length - index;
    animationController.current[index]?.set({ zIndex });

    return async (next: (...args: unknown[]) => Promise<void>) => {
      let speedUp = false;
      let cancelWaitFn = () => {};
      animatedCard.speedUpAnimation = () => {
        speedUp = true;
        cancelWaitFn();
      };

      const { x, y } = getXYToTarget();
      await next({ x, y, scale: 1.25, rotate: 0, config: config.stiff });

      if (!speedUp) {
        const [waitPromise, cancelWait] = cancelableWait(500);
        cancelWaitFn = cancelWait;
        await waitPromise;
      }

      await next({
        ...playCardEnd(),
        config: { duration: 300, easing: easings.easeInBack },
      });
    };
  }

  const render = useTransition(deck, {
    key: ({ key }: CardAnimation) => key,
    from: isDealingCards ? dealCardStart : playCardEnd,
    enter: dealCard,
    leave: playCard,
    ref: animationController,
  });

  useEffect(() => {
    animationController.start();
  }, [animationController, currentCardIndex]);

  return render;
}
