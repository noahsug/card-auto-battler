import random from 'lodash/random';
import { useRef, useEffect } from 'react';

import { CardState } from '../../../game/gameState';
import { BattleEvent } from '../../../game/actions/battleEvent';
import { UnitFn, useUnits } from '../../hooks/useUnits';
import { useSpringRef, useTransition, config } from '@react-spring/web';
import { Direction } from '../../../utils/types';

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
}

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
    zIndex: 0,
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
  const { x, y } = getXYToTarget(context);
  return { x, y, scale: 1.25, rotate: 0, config: config.stiff };
}

function getAnimation(animationState: CardAnimationState, context: AnimationContext) {
  switch (context.animation?.type) {
    case 'cardPlayed':
      if (context.animation.cardId === animationState.card.acquiredId) {
        return getPlayAnimation(animationState, context);
      }
      break;
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
  const animationController = useSpringRef();
  const cardAnimationsRef = useRef<CardAnimationState[]>(cards.map(createCardAnimationState));
  const animationQueue = useRef<BattleEvent[]>(events);

  const animation = animationQueue.current[0];
  const [u, windowDimensions] = useUnits();
  const cardDealDirection = getCardDealDirection(selfElement, targetElement);

  const context: AnimationContext = {
    cards,
    currentCardIndex,
    selfElement,
    targetElement,
    u,
    windowDimensions,
    cardDealDirection,
    animation,
  };

  if (!animation) {
    animationController.stop();
  }

  useEffect(() => {
    animationController.start();
  }, [
    animationController,
    cards,
    currentCardIndex,
    selfElement,
    targetElement,
    u,
    windowDimensions,
    cardDealDirection,
    animation,
  ]);

  // wait for self and target elements to be defined before rendering animations
  const cardAnimations = selfElement && targetElement ? cardAnimationsRef.current : [];

  return useTransition(cardAnimations, {
    key: (c: CardAnimationState) => c.card.acquiredId,
    from: getDiscardPosition(context),
    enter: (c: CardAnimationState) => getAnimation(c, context),
    update: (c: CardAnimationState) => getAnimation(c, context),
    ref: animationController,
    deps: [
      cards,
      currentCardIndex,
      selfElement,
      targetElement,
      u,
      windowDimensions,
      cardDealDirection,
      animation,
    ],
  });
}
