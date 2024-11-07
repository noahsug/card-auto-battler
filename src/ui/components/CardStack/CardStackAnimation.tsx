import { animated, config, easings, useSpringRef, useTransition } from '@react-spring/web';
import random from 'lodash/random';
import { useCallback, useEffect, useRef, useState } from 'react';
import { styled } from 'styled-components';

import { BattleEvent, CardBattleEvent } from '../../../game/actions/battleEvent';
import { CardState } from '../../../game/gameState';
import { Direction } from '../../../utils/types';
import { Z_INDEX } from '../../constants';
import { UnitFn, useUnits, WindowDimensions } from '../../hooks/useUnits';
import { SpringRef } from '../../utils/reactSpring';
import { Card } from '../Card';
import { assertIsNonNullable } from '../../../utils/asserts';

export interface Props {
  cards: CardState[];
  currentCardIndex: number;
  events: BattleEvent[];
  onAnimationComplete: () => void;
  selfElement: Element;
  targetElement: Element;
}

interface CardAnimationState {
  cardId: number;
  rotation: number;
  deckIndex: number;
  inDiscard: boolean;
}

interface AnimationContext {
  cards: CardState[];
  currentCardIndex: number;
  selfElement: Element;
  targetElement: Element;
  u: UnitFn;
  windowDimensions: WindowDimensions;
  cardDealDirection: Direction;
  event: BattleEvent | undefined;
  nextEvent: () => void;
  animationController: SpringRef;
}

const animatedEvents = new Set<Partial<BattleEvent['type']>>([
  'startBattle',
  'playCard',
  'discardCard',
  'trashCard',
  'shuffle',
  'addTemporaryCard',
]);

function createCardAnimationState(
  card: CardState,
  deckIndex: number,
  currentCardIndex: number,
): CardAnimationState {
  return {
    cardId: card.acquiredId,
    deckIndex,
    rotation: random(-10, 10),
    inDiscard: deckIndex < currentCardIndex,
  };
}

function getCardDealDirection(selfElement: Element, targetElement: Element): Direction {
  const selfRect = selfElement.getBoundingClientRect();
  const targetRect = targetElement.getBoundingClientRect();

  return selfRect.left < targetRect.left ? 1 : -1;
}

function syncCardAnimations({
  cardAnimations,
  context,
}: {
  cardAnimations: CardAnimationState[];
  context: AnimationContext;
}) {
  const { cards, currentCardIndex, animationController } = context;
  cards.forEach((card, index) => {
    const newAnimationState = createCardAnimationState(card, index, currentCardIndex);
    const existingCardAnimation = cardAnimations.find((c) => c.cardId === card.acquiredId);
    if (existingCardAnimation) {
      existingCardAnimation.deckIndex = newAnimationState.deckIndex;
      existingCardAnimation.inDiscard = newAnimationState.inDiscard;
    } else {
      cardAnimations.push(newAnimationState);
    }
  });

  animationController.set((index: number) => {
    const cardAnimation = cardAnimations[index];
    if (!cards.find((c) => c.acquiredId === cardAnimation.cardId)) {
      // card is trashed or hasn't been created yet
      cardAnimation.inDiscard = false;
      return { opacity: 0 };
    }
    if (cardAnimation.inDiscard) {
      return getDiscardPosition(cardAnimation, context);
    }
    // card is in deck
    return { x: 0, y: 0, rotate: cardAnimation.rotation, scale: 1, opacity: 1 };
  });
}

function syncZIndex(cardAnimation: CardAnimationState, context: AnimationContext, index: number) {
  cardAnimation.deckIndex = context.cards.findIndex((c) => c.acquiredId === cardAnimation.cardId);
  // TODO: Remove this part and have deal card use immediate:true to set the initial zIndex
  context.animationController.current[index]?.set(getDiscardPosition(cardAnimation, context));
}

function getXYToTarget({ selfElement, targetElement, cardDealDirection }: AnimationContext) {
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

function getDiscardPosition(
  cardAnimation: CardAnimationState,
  { windowDimensions, cardDealDirection, cards }: AnimationContext,
) {
  const reverseIndex = cards.length - 1 - cardAnimation.deckIndex;

  return {
    x: windowDimensions.width * -cardDealDirection,
    y: 0,
    rotate: 0,
    scale: 1.5,
    opacity: 1,
    zIndex: Z_INDEX.cards + reverseIndex,
  };
}

function getDeckPosition(
  cardAnimation: CardAnimationState,
  { u, cardDealDirection, cards }: AnimationContext,
) {
  const reverseIndex = cards.length - 1 - cardAnimation.deckIndex;

  return {
    x: u(reverseIndex * cardDealDirection),
    y: u(-reverseIndex),
    rotate: cardAnimation.rotation,
    scale: 1,
    opacity: 1,
  };
}

function dealCard(cardAnimation: CardAnimationState, context: AnimationContext) {
  const { cards, nextEvent } = context;
  const reverseIndex = cards.length - 1 - cardAnimation.deckIndex;

  return async (next: (options: object) => Promise<void>) => {
    const deckPosition = getDeckPosition(cardAnimation, context);
    await next({
      ...deckPosition,
      delay: (reverseIndex * 300) / Math.sqrt(cards.length),
      config: config.default,
    });

    cardAnimation.inDiscard = false;
    nextEvent();
  };
}

function playCard(context: AnimationContext) {
  const { nextEvent } = context;

  const { x, y } = getXYToTarget(context);
  return async (next: (options: object) => Promise<void>) => {
    await next({ x, y, scale: 1.25, rotate: 0, config: { ...config.stiff, clamp: true } });
    nextEvent();
  };
}

function discardCard(cardAnimation: CardAnimationState, context: AnimationContext) {
  const { u, nextEvent } = context;

  return async (next: (options: object) => Promise<void>) => {
    await next({ y: u(-1000), rotate: 0, config: { duration: 300, easing: easings.easeInBack } });

    const discardPosition = getDiscardPosition(cardAnimation, context);
    await next({ ...discardPosition, config: { duration: 0 } });

    cardAnimation.inDiscard = true;
    nextEvent();
  };
}

function trashCard(context: AnimationContext) {
  const { nextEvent } = context;

  return async (next: (options: object) => Promise<void>) => {
    await next({ opacity: 0, config: config.default });

    nextEvent();
  };
}

function animate(cardAnimation: CardAnimationState, index: number, context: AnimationContext) {
  const { event } = context;
  if (!event) return null;

  if ((event as CardBattleEvent).cardId === cardAnimation.cardId) {
    switch (event.type) {
      case 'playCard':
        return playCard(context);
      case 'discardCard':
        return discardCard(cardAnimation, context);
      case 'trashCard':
        return trashCard(context);
    }
  }

  if (
    (event.type === 'shuffle' && cardAnimation.inDiscard) ||
    (event.type === 'startBattle' && !cardAnimation.inDiscard)
  ) {
    // TODO: Move this into nextEvent (similar to syncCardAnimations), and do it for all cards
    // update z-index to match new card order after shuffle
    syncZIndex(cardAnimation, context, index);
    return dealCard(cardAnimation, context);
  }
  return null;
}

const AnimatedContainer = styled(animated.div)`
  position: absolute;
  inset: 0;
`;

export function CardStackAnimation({
  cards,
  currentCardIndex,
  events,
  onAnimationComplete,
  selfElement,
  targetElement,
}: Props) {
  const [u, windowDimensions] = useUnits();
  const cardDealDirection = getCardDealDirection(selfElement, targetElement);
  const animationController = useSpringRef();

  const cardAnimationsRef = useRef<CardAnimationState[]>([]);
  const [eventQueue, setEventQueue] = useState<BattleEvent[]>([]);
  const event = eventQueue[0];
  const cardPlayedTimeout = useRef<NodeJS.Timeout | null>(null);

  // queue new animated events
  useEffect(() => {
    setEventQueue((currentEvents) => {
      const newEvents = events.filter((e) => animatedEvents.has(e.type));
      return [...currentEvents, ...newEvents];
    });
  }, [events]);

  // call the onAnimationComplete callback after certain events
  useEffect(() => {
    if (event == null) onAnimationComplete();
  }, [event, onAnimationComplete]);

  const nextEvent = useCallback(() => {
    setEventQueue((prev) => {
      const [, ...next] = prev;
      return next;
    });
  }, []);

  const context: AnimationContext = {
    cards,
    currentCardIndex,
    selfElement,
    targetElement,
    u,
    windowDimensions,
    cardDealDirection,
    event,
    nextEvent,
    animationController,
  };

  // initialize card animations
  useEffect(() => {
    syncCardAnimations({
      cardAnimations: cardAnimationsRef.current,
      context,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    animationController.start();
  }, [animationController, event]);

  const render = useTransition(cardAnimationsRef.current, {
    key: (c: CardAnimationState) => c.cardId,
    from: (c: CardAnimationState) => getDiscardPosition(c, context),
    enter: (c: CardAnimationState, i: number) => animate(c, i, context),
    update: (c: CardAnimationState, i: number) => animate(c, i, context),
    ref: animationController,
    deps: [event, u],
  });

  return render((style, { cardId }) => {
    const card = cards.find((c) => c.acquiredId === cardId);
    assertIsNonNullable(card);
    return (
      <AnimatedContainer style={style}>
        <Card card={card} size="medium" />
      </AnimatedContainer>
    );
  });
}
