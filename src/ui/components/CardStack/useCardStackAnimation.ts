import random from 'lodash/random';
import { useRef, useEffect, useMemo, useState, useCallback } from 'react';

import { CardState } from '../../../game/gameState';
import { BattleEvent } from '../../../game/actions/battleEvent';
import { UnitFn, useUnits } from '../../hooks/useUnits';
import { useSpringRef, useTransition, config, easings } from '@react-spring/web';
import { Direction } from '../../../utils/types';
import { wait } from '../../../utils/wait';

export interface Props {
  cards: CardState[];
  currentCardIndex: number;
  events: BattleEvent[];
  selfElement: Element | null;
  targetElement: Element | null;
}

interface CardAnimationState {
  card: CardState;
  rotation: number;
  index: number;
}

interface AnimationContext {
  cards: Props['cards'];
  currentCardIndex: Props['currentCardIndex'];
  selfElement: Props['selfElement'];
  targetElement: Props['targetElement'];
  u: UnitFn;
  windowDimensions: { width: number; height: number };
  cardDealDirection: Direction;
  animation: BattleEvent | undefined;
  goToNextAnimation: () => void;
}

const animatedEvents = new Set<Partial<BattleEvent['type']>>([
  'cardPlayed',
  'cardDiscarded',
  'cardTrashed',
  'shuffled',
  'temporaryCardAdded',
]);

function createCardAnimationState(card: CardState, index: number): CardAnimationState {
  return {
    card,
    index,
    rotation: random(-10, 10),
  };
}

function getCardDealDirection(
  selfElement: Element | null,
  targetElement: Element | null,
): Direction {
  if (!selfElement || !targetElement) {
    return 1;
  }

  const selfRect = selfElement.getBoundingClientRect();
  const targetRect = targetElement.getBoundingClientRect();

  return selfRect.left < targetRect.left ? 1 : -1;
}

function getXYToTarget({ selfElement, targetElement, cardDealDirection }: AnimationContext) {
  if (selfElement == null || targetElement == null) return { x: 0, y: 0 };

  const selfRect = selfElement.getBoundingClientRect();
  const targetRect = targetElement.getBoundingClientRect();
  // we're measuring movement from the top left corner of the card, so we need to reduce its x
  // movement by the width of the card or the width of the target, depending on the direction
  const xOffset = cardDealDirection === 1 ? -selfRect.width : targetRect.width;
  return {
    x: targetRect.x - selfRect.x + xOffset,
    y: targetRect.y - selfRect.y,
  };
}

function getIsInDeck({ card }: CardAnimationState, { cards, currentCardIndex }: AnimationContext) {
  const index = cards.findIndex((c) => c.acquiredId === card.acquiredId);
  return index >= currentCardIndex;
}

function getDiscardPosition({ windowDimensions, cardDealDirection }: AnimationContext) {
  return {
    x: windowDimensions.width * -cardDealDirection,
    y: 0,
    rotate: 0,
    scale: 1.5,
  };
}

function getDealAnimation(
  { index, rotation }: CardAnimationState,
  { u, cardDealDirection, cards }: AnimationContext,
) {
  return {
    x: u(index * cardDealDirection),
    y: u(-index),
    rotate: rotation,
    scale: 1,
    delay: (index * 300) / Math.sqrt(cards.length),
    config: config.default,
  };
}

function getPlayAnimation(animationState: CardAnimationState, context: AnimationContext) {
  console.log('getPlayAnimation');
  const { goToNextAnimation } = context;

  const { x, y } = getXYToTarget(context);
  return async (next: (options: object) => Promise<void>) => {
    await next({ x, y, scale: 1.25, rotate: 0, config: config.stiff });
    await wait(2000);
    goToNextAnimation();
  };
}

function getDiscardAnimation(animationState: CardAnimationState, context: AnimationContext) {
  console.log('getDiscardAnimation');
  const { u, goToNextAnimation } = context;

  return async (next: (options: object) => Promise<void>) => {
    await next({ y: u(-1000), rotate: 0, config: { duration: 300, easing: easings.easeInBack } });
    goToNextAnimation();
  };
}

function getAnimation(animationState: CardAnimationState, context: AnimationContext) {
  switch (context.animation?.type) {
    case 'cardPlayed':
      if (context.animation.cardId === animationState.card.acquiredId) {
        return getPlayAnimation(animationState, context);
      }
      break;
    case 'cardDiscarded':
      if (context.animation.cardId === animationState.card.acquiredId) {
        return getDiscardAnimation(animationState, context);
      }
  }

  if (getIsInDeck(animationState, context)) {
    return getDealAnimation(animationState, context);
  }
  return getDiscardPosition(context);
}

export function useCardStackAnimation({
  cards,
  currentCardIndex,
  events,
  selfElement,
  targetElement,
}: Props) {
  const [u, windowDimensions] = useUnits();
  const cardDealDirection = getCardDealDirection(selfElement, targetElement);
  const animationController = useSpringRef();

  const cardAnimationsRef = useRef<CardAnimationState[]>(cards.map(createCardAnimationState));

  const animationQueue = useRef<BattleEvent[]>([]);
  const [animation, setAnimation] = useState<BattleEvent | undefined>();

  animationQueue.current = useMemo(() => {
    const queue = events.filter((e) => animatedEvents.has(e.type));
    setAnimation(queue.shift());
    return queue;
  }, [events]);

  const goToNextAnimation = useCallback(() => {
    const next = animationQueue.current.shift();
    console.log('goToNextAnimation', next?.type);
    setAnimation(next);
  }, []);

  // if (!animationQueue.current.length === 0) {
  //   animationController.stop();
  // }

  useEffect(() => {
    animationController.start();
  }, [animationController, animation, selfElement, targetElement]);

  const context: AnimationContext = {
    cards,
    currentCardIndex,
    selfElement,
    targetElement,
    u,
    windowDimensions,
    cardDealDirection,
    animation,
    goToNextAnimation,
  };

  // wait for self and target elements to be defined before rendering animations
  const cardAnimations = selfElement && targetElement ? cardAnimationsRef.current : [];

  return useTransition(cardAnimations, {
    key: (c: CardAnimationState) => c.card.acquiredId,
    from: getDiscardPosition(context),
    enter: (c: CardAnimationState) => getAnimation(c, context),
    update: (c: CardAnimationState) => getAnimation(c, context),
    ref: animationController,
    deps: [cards, currentCardIndex, selfElement, targetElement, u, animation],
  });
}
