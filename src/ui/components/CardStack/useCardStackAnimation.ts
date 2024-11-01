import random from 'lodash/random';
import { useRef, useEffect, useMemo, useState, useCallback } from 'react';

import { CardState } from '../../../game/gameState';
import { BattleEvent } from '../../../game/actions/battleEvent';
import { UnitFn, useUnits } from '../../hooks/useUnits';
import { useSpringRef, useTransition, config, easings } from '@react-spring/web';
import { Direction } from '../../../utils/types';
import { wait } from '../../../utils/wait';
import { Z_INDEX } from '../../constants';

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
  deckIndex: number;
  state: 'inDeck' | 'inDiscard';
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

function createCardAnimationState(card: CardState, deckIndex: number): CardAnimationState {
  return {
    card,
    deckIndex,
    rotation: random(-10, 10),
    state: 'inDeck',
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

function getDiscardPosition(
  { deckIndex }: CardAnimationState,
  { windowDimensions, cardDealDirection }: AnimationContext,
) {
  return {
    x: windowDimensions.width * -cardDealDirection,
    y: 0,
    rotate: 0,
    scale: 1.5,
    zIndex: Z_INDEX.cards - deckIndex,
  };
}

function dealCard(
  animationState: CardAnimationState,
  { u, cardDealDirection, cards }: AnimationContext,
) {
  // deal the last card first
  const reverseIndex = cards.length - animationState.deckIndex;

  return {
    x: u(reverseIndex * cardDealDirection),
    y: u(-reverseIndex),
    rotate: animationState.rotation,
    scale: 1,
    delay: (reverseIndex * 300) / Math.sqrt(cards.length),
    config: config.default,
  };
}

function playCard(animationState: CardAnimationState, context: AnimationContext) {
  const { goToNextAnimation } = context;

  const { x, y } = getXYToTarget(context);
  return async (next: (options: object) => Promise<void>) => {
    await next({ x, y, scale: 1.25, rotate: 0, config: config.stiff });
    await wait(500);
    goToNextAnimation();
  };
}

function discardCard(animationState: CardAnimationState, context: AnimationContext) {
  const { u, goToNextAnimation } = context;

  return async (next: (options: object) => Promise<void>) => {
    await next({ y: u(-1000), rotate: 0, config: { duration: 300, easing: easings.easeInBack } });
    await next({ ...getDiscardPosition(animationState, context), config: { duration: 0 } });
    animationState.state = 'inDiscard';
    goToNextAnimation();
  };
}

function animate(animationState: CardAnimationState, context: AnimationContext) {
  switch (context.animation?.type) {
    case 'cardPlayed':
      if (context.animation.cardId === animationState.card.acquiredId) {
        return playCard(animationState, context);
      }
      break;
    case 'cardDiscarded':
      if (context.animation.cardId === animationState.card.acquiredId) {
        return discardCard(animationState, context);
      }
      break;
    case 'shuffled':
      animationState.state = 'inDeck';
      break;
  }

  if (animationState.state === 'inDeck') {
    return dealCard(animationState, context);
  }
  return getDiscardPosition(animationState, context);
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

  // if (animation === undefined) {
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
    from: (c: CardAnimationState) => getDiscardPosition(c, context),
    enter: (c: CardAnimationState) => animate(c, context),
    update: (c: CardAnimationState) => animate(c, context),
    ref: animationController,
    deps: [cards, currentCardIndex, selfElement, targetElement, u, animation],
  });
}
