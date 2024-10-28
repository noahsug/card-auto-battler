import random from 'lodash/random';
import { useEffect, useRef, useState } from 'react';

import { config, easings, useSpringRef, useTransition } from '@react-spring/web';
import { CardState } from '../../../game/gameState';
import { Direction } from '../../../utils/types';
import { cancelableWait } from '../../../utils/wait';
import { useUnits } from '../../hooks/useUnits';
import { ControllerUpdate, TransitionTo } from '../../utils/reactSpring';

export interface Props {
  cards: CardState[];
  currentCardIndex: number;
  selfElement: Element | null;
  targetElement: Element | null;
  cardDealDirection: Direction;
  turn: number;
}

// milliseconds it takes the card to animate from the deck to the player
export const CARD_ANIMATION_DELAY = 200;

function useIsDealingCards(
  currentCardIndex: number,
  cardAnimations: CardAnimation[],
): [boolean, CardAnimation | null] {
  const prevCardIndex = useRef(currentCardIndex);
  const currentCardIndexRef = useRef(currentCardIndex);

  if (currentCardIndexRef.current !== currentCardIndex) {
    prevCardIndex.current = currentCardIndexRef.current;
    currentCardIndexRef.current = currentCardIndex;
  }

  const justStartedBattle = currentCardIndex === 0 && prevCardIndex.current === 0;
  const lastPlayedCard = justStartedBattle ? null : cardAnimations[prevCardIndex.current];

  const isDealingCards = justStartedBattle || currentCardIndex === 0;

  return [isDealingCards, lastPlayedCard];
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
  const cardAnimationsRef = useRef(cards.map(createCardAnimation));
  const [isDealingCards, lastPlayedCard] = useIsDealingCards(
    currentCardIndex,
    cardAnimationsRef.current,
  );
  const animationController = useSpringRef();

  // set to true after the last card play animation finishes, which triggers the discard deal
  // animation
  const [isReDealingDiscard, setIsReDealingDiscard] = useState(false);
  if (currentCardIndex > 0 && isReDealingDiscard) setIsReDealingDiscard(false);

  const deck =
    isDealingCards && lastPlayedCard && !isReDealingDiscard
      ? // wait to play the last card before shuffling the discard pile back into the deck
        []
      : // reverse card order so the first card is rendered last and displayed on top
        cardAnimationsRef.current.slice(currentCardIndex).reverse();

  function speedUpExistingAnimations() {
    cardAnimationsRef.current.forEach((card) => card.speedUpAnimation());
  }

  // speed up animation when a turn ends early
  useEffect(() => {
    speedUpExistingAnimations();
  }, [turn]);

  function getDealCardAnimationStart() {
    return {
      x: windowDimensions.width * -cardDealDirection,
      y: 0,
      rotate: 0,
      scale: 1.5,
      zIndex: 0,
    };
  }

  function getPlayCardAnimationEnd() {
    return {
      y: u(-1000),
      rotate: 0,
      zIndex: 1,
    };
  }

  function getDealCardAnimation(animatedCard: CardAnimation, index: number) {
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

  function getPlayCardAnimation(animatedCard: CardAnimation, index: number) {
    speedUpExistingAnimations();

    // show the currently played card on top
    const zIndex = cardAnimationsRef.current.length - index;
    animationController.current[index]?.set({ zIndex });

    return async (next: (options: object) => Promise<void>) => {
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
        ...getPlayCardAnimationEnd(),
        config: { duration: 300, easing: easings.easeInBack },
      });

      setIsReDealingDiscard(true);
    };
  }

  const render = useTransition(deck, {
    key: ({ key }: CardAnimation) => key,
    from: isDealingCards ? getDealCardAnimationStart : getPlayCardAnimationEnd,
    enter: getDealCardAnimation,
    leave: getPlayCardAnimation,
    ref: animationController,
  });

  useEffect(() => {
    animationController.start();
  }, [animationController, currentCardIndex, isReDealingDiscard]);

  return render;
}
