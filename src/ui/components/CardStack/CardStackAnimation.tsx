import random from 'lodash/random';
import { useCallback, useEffect, useRef, useState } from 'react';

import { animated, config, easings, useSpringRef, useTransition } from '@react-spring/web';
import { styled } from 'styled-components';
import { BattleEvent, CardBattleEvent } from '../../../game/actions/battleEvent';
import { CardState } from '../../../game/gameState';
import { Direction } from '../../../utils/types';
import { wait } from '../../../utils/wait';
import { Z_INDEX } from '../../constants';
import { UnitFn, useUnits, WindowDimensions } from '../../hooks/useUnits';
import { Card } from '../Card';
import { SpringRef } from '../../utils/reactSpring';

export interface Props {
  cards: CardState[];
  currentCardIndex: number;
  events: BattleEvent[];
  selfElement: Element;
  targetElement: Element;
}

interface CardAnimationState {
  card: CardState;
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
  'cardPlayed',
  'cardDiscarded',
  'cardTrashed',
  'shuffled',
  'temporaryCardAdded',
]);

function createCardAnimationState(
  card: CardState,
  deckIndex: number,
  currentCardIndex: number,
): CardAnimationState {
  return {
    card,
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
    const existingCardAnimation = cardAnimations.find((c) => c.card.acquiredId === card.acquiredId);
    if (existingCardAnimation) {
      existingCardAnimation.deckIndex = newAnimationState.deckIndex;
      existingCardAnimation.card = newAnimationState.card;
      existingCardAnimation.inDiscard = newAnimationState.inDiscard;
    } else {
      cardAnimations.push(newAnimationState);
    }
  });

  animationController.set((index: number) => {
    const cardAnimation = cardAnimations[index];
    if (!cards.includes(cardAnimation.card)) {
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
  cardAnimation.deckIndex = context.cards.findIndex(
    (c) => c.acquiredId === cardAnimation.card.acquiredId,
  );
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
    await next({ x, y, scale: 1.25, rotate: 0, config: config.stiff });
    await wait(500);

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

  if ((event as CardBattleEvent).cardId === cardAnimation.card.acquiredId) {
    switch (event.type) {
      case 'cardPlayed':
        return playCard(context);
      case 'cardDiscarded':
        return discardCard(cardAnimation, context);
      case 'cardTrashed':
        return trashCard(context);
    }
  }

  if (
    (event.type === 'shuffled' && cardAnimation.inDiscard) ||
    (event.type === 'startBattle' && !cardAnimation.inDiscard)
  ) {
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
  selfElement,
  targetElement,
}: Props) {
  const [u, windowDimensions] = useUnits();
  const cardDealDirection = getCardDealDirection(selfElement, targetElement);
  const animationController = useSpringRef();

  const cardAnimationsRef = useRef<CardAnimationState[]>([]);
  const eventQueue = useRef<BattleEvent[]>([]);
  const [event, setEvent] = useState<BattleEvent>();

  const nextEvent = useCallback(() => {
    setEvent(eventQueue.current.shift());
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
    eventQueue.current = events.filter((e) => animatedEvents.has(e.type));
    nextEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, cards, currentCardIndex]);

  useEffect(() => {
    animationController.start();
  }, [animationController, event]);

  let maxX: number | null = null;

  const render = useTransition(cardAnimationsRef.current, {
    key: (c: CardAnimationState) => c.card.acquiredId,
    from: (c: CardAnimationState) => getDiscardPosition(c, context),
    enter: (c: CardAnimationState, i: number) => animate(c, i, context),
    update: (c: CardAnimationState, i: number) => animate(c, i, context),
    onChange(result, _, item) {
      if (event?.type === 'cardPlayed' && event.cardId === item.card.acquiredId) {
        if (maxX == null) {
          maxX = result.value.x as number;
        } else {
          const x = result.value.x as number;
          if (x >= maxX) {
            maxX = x;
          } else {
            console.log('NOW');
          }
        }
      }
    },
    ref: animationController,
    deps: [event, u],
  });

  return render((style, { card }) => (
    <AnimatedContainer style={style}>
      <Card card={card} size="medium" />
    </AnimatedContainer>
  ));
}
