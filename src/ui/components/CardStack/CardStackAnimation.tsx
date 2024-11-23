import { animated, config, easings, useTransition } from '@react-spring/web';
import random from 'lodash/random';
import { MutableRefObject, useEffect, useRef } from 'react';
import { styled } from 'styled-components';

import { BattleEvent, CardBattleEvent } from '../../../game/actions/battleEvent';
import { CardState } from '../../../game/gameState';
import { Direction } from '../../../utils/types';
import { cancelableWait } from '../../../utils/wait';
import { Z_INDEX } from '../../constants';
import { UnitFn, useUnits, WindowDimensions } from '../../hooks/useUnits';
import { Card } from '../Card';

export interface Props {
  cards: CardState[];
  currentCardIndex: number;
  event: BattleEvent | undefined;
  onAnimationComplete: () => void;
  deckBoundingRect: DOMRect;
  opponentBoundingRect: DOMRect;
  isFastForwarding: boolean;
}

const AnimatedContainer = styled(animated.div)`
  position: absolute;
  inset: 0;
`;

type CancelWaitReasons = 'undo' | 'fast-forward';

interface CardAnimationState {
  card: CardState;
  rotation: number;
  deckIndex: number;
  inDiscard: boolean;
  isAnimating: boolean;
  finishedAnimatingEvent?: BattleEvent;
  cancelWait?: (reason?: CancelWaitReasons) => void;
}

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
    isAnimating: false,
  };
}

interface AnimationContext {
  cards: CardState[];
  currentCardIndex: number;
  event?: BattleEvent;
  onCardAnimationComplete: (cardAnimation: CardAnimationState) => void;
  deckBoundingRect: DOMRect;
  opponentBoundingRect: DOMRect;
  u: UnitFn;
  windowDimensions: WindowDimensions;
  isFastForwardingRef: MutableRefObject<boolean>;
}

function syncDeckIndex(cardAnimation: CardAnimationState, context: AnimationContext) {
  cardAnimation.deckIndex = context.cards.findIndex(
    (c) => c.acquiredId === cardAnimation.card.acquiredId,
  );
}

function syncCard(cardAnimation: CardAnimationState, context: AnimationContext) {
  syncDeckIndex(cardAnimation, context);
  cardAnimation.inDiscard =
    cardAnimation.deckIndex >= 0 && cardAnimation.deckIndex < context.currentCardIndex;
}

function getCardDealDirection({
  deckBoundingRect,
  opponentBoundingRect,
}: Pick<AnimationContext, 'deckBoundingRect' | 'opponentBoundingRect'>): Direction {
  return deckBoundingRect.left < opponentBoundingRect.left ? 1 : -1;
}

function getReverseIndex(
  cardAnimation: CardAnimationState,
  { cards }: Pick<AnimationContext, 'cards'>,
) {
  return cards.length - 1 - cardAnimation.deckIndex;
}

function getXYToTarget({
  deckBoundingRect: deckBoundingRect,
  opponentBoundingRect: opponentBoundingRect,
}: Pick<AnimationContext, 'deckBoundingRect' | 'opponentBoundingRect'>) {
  // we're measuring movement from the top left corner of the card, so we need to reduce its x
  // movement by the width of the card or the width of the target, depending on the direction
  const cardDealDirection = getCardDealDirection({
    deckBoundingRect: deckBoundingRect,
    opponentBoundingRect: opponentBoundingRect,
  });
  const xOffset = cardDealDirection === 1 ? -deckBoundingRect.width : opponentBoundingRect.width;
  return {
    x: opponentBoundingRect.x - deckBoundingRect.x + xOffset,
    y: opponentBoundingRect.y - deckBoundingRect.y,
  };
}

function getZIndex(cardAnimation: CardAnimationState, context: AnimationContext) {
  return Z_INDEX.cards + getReverseIndex(cardAnimation, context);
}

function getDiscardPosition(cardAnimation: CardAnimationState, context: AnimationContext) {
  const cardDealDirection = getCardDealDirection(context);
  return {
    x: context.windowDimensions.width * -cardDealDirection,
    y: 0,
    rotate: 0,
    scale: 1.5,
    opacity: 1,
    zIndex: getZIndex(cardAnimation, context),
  };
}

function getDeckPosition(cardAnimation: CardAnimationState, context: AnimationContext) {
  const { u } = context;
  const cardDealDirection = getCardDealDirection(context);
  const reverseIndex = getReverseIndex(cardAnimation, context);

  return {
    x: u(reverseIndex * cardDealDirection),
    y: u(-reverseIndex),
    rotate: cardAnimation.rotation,
    scale: 1,
    opacity: 1,
  };
}

function dealCard(cardAnimation: CardAnimationState, context: AnimationContext) {
  // console.log('CSA dealCard', cardAnimation.card.acquiredId);
  const { cards, onCardAnimationComplete, isFastForwardingRef } = context;
  const reverseIndex = cards.length - 1 - cardAnimation.deckIndex;
  cardAnimation.isAnimating = true;

  return async (next: (options: object) => Promise<void>) => {
    const discardPosition = getDiscardPosition(cardAnimation, context);
    await next({
      ...discardPosition,
      immediate: true,
    });

    const delay = isFastForwardingRef.current ? 100 : 300;

    const deckPosition = getDeckPosition(cardAnimation, context);
    await next({
      ...deckPosition,
      delay: (reverseIndex * delay) / Math.sqrt(cards.length),
      config: config.default,
    });

    cardAnimation.inDiscard = false;
    onCardAnimationComplete(cardAnimation);
  };
}

function playCard(cardAnimation: CardAnimationState, context: AnimationContext) {
  // console.log('CSA playCard', cardAnimation.card.acquiredId);
  const { onCardAnimationComplete } = context;
  const { x, y } = getXYToTarget(context);
  cardAnimation.isAnimating = true;

  return async (next: (options: object) => Promise<void>) => {
    await next({ x, y, scale: 1.25, rotate: 0, config: { ...config.stiff, clamp: false } });

    const wait = context.isFastForwardingRef.current ? 0 : 700;
    const [promise, cancel] = cancelableWait<CancelWaitReasons>(wait);
    cardAnimation.cancelWait = cancel;
    const cancelReason = await promise;

    if (cancelReason !== 'undo') {
      onCardAnimationComplete(cardAnimation);
    }
  };
}

function discardCard(cardAnimation: CardAnimationState, context: AnimationContext) {
  // console.log('CSA discardCard', cardAnimation.card.acquiredId);
  const { u, onCardAnimationComplete } = context;
  cardAnimation.isAnimating = true;

  return async (next: (options: object) => Promise<void>) => {
    const duration = context.isFastForwardingRef.current ? 100 : 300;
    await next({ y: u(-1000), rotate: 0, config: { duration, easing: easings.easeInExpo } });

    cardAnimation.inDiscard = true;
    onCardAnimationComplete(cardAnimation);
  };
}

function trashCard(cardAnimation: CardAnimationState, context: AnimationContext) {
  // console.log('CSA trashCard', cardAnimation.card.acquiredId);
  const { onCardAnimationComplete } = context;
  cardAnimation.isAnimating = true;

  return async (next: (options: object) => Promise<void>) => {
    await next({ opacity: 0, config: config.default });
    onCardAnimationComplete(cardAnimation);
  };
}

function returnCardToCorrectPosition(cardAnimation: CardAnimationState, context: AnimationContext) {
  // console.log('CSA returnCardToCorrectPosition', cardAnimation.card.acquiredId);
  const { onCardAnimationComplete } = context;
  cardAnimation.isAnimating = true;

  return async (next: (options: object) => Promise<void>) => {
    // don't animate if the card is trashed
    if (cardAnimation.deckIndex < 0) {
      onCardAnimationComplete(cardAnimation);
      return null;
    }

    const position = cardAnimation.inDiscard
      ? getDiscardPosition(cardAnimation, context)
      : getDeckPosition(cardAnimation, context);

    await next({
      ...position,
      zIndex: getZIndex(cardAnimation, context),
      config: { ...config.stiff, clamp: true },
    });

    onCardAnimationComplete(cardAnimation);
  };
}

function animate(cardAnimation: CardAnimationState, context: AnimationContext) {
  const { event } = context;
  // animating the same event a 2nd time after it's been finished causes the 2nd animation to never
  // finish, so we check finishedAnimatingEvent to prevent that
  if (!event || cardAnimation.finishedAnimatingEvent === event) {
    return null;
  }

  if ((event as CardBattleEvent).cardId === cardAnimation.card.acquiredId) {
    switch (event.type) {
      case 'startPlayCard':
        return playCard(cardAnimation, context);
      case 'discardCard':
        return discardCard(cardAnimation, context);
      case 'trashCard':
        return trashCard(cardAnimation, context);
    }
  }

  if (
    (event.type === 'shuffle' && cardAnimation.inDiscard) ||
    (event.type === 'startBattle' && !cardAnimation.inDiscard)
  ) {
    syncDeckIndex(cardAnimation, context);
    return dealCard(cardAnimation, context);
  }

  if (event.type === 'undo') {
    syncCard(cardAnimation, context);
    return returnCardToCorrectPosition(cardAnimation, context);
  }

  return null;
}

export function CardStackAnimation({
  cards,
  currentCardIndex,
  event,
  onAnimationComplete,
  deckBoundingRect,
  opponentBoundingRect,
  isFastForwarding,
}: Props) {
  const [u, windowDimensions] = useUnits();

  // move to ref so we can access the most up-to-date version in the animation functions
  const isFastForwardingRef = useRef(isFastForwarding);
  isFastForwardingRef.current = isFastForwarding;

  const cardAnimationsRef = useRef<CardAnimationState[]>(
    cards.map((card, i) => createCardAnimationState(card, i, currentCardIndex)),
  );

  const onCardAnimationComplete = (cardAnimation: CardAnimationState) => {
    cardAnimation.isAnimating = false;
    cardAnimation.finishedAnimatingEvent = event;
    const animationsComplete = cardAnimationsRef.current.every((c) => !c.isAnimating);
    if (animationsComplete) {
      // console.log('CSA onAnimationComplete', event?.type);
      onAnimationComplete();
    }
  };

  const context: AnimationContext = {
    cards,
    currentCardIndex,
    event,
    onCardAnimationComplete,
    deckBoundingRect,
    opponentBoundingRect,
    u,
    windowDimensions,
    isFastForwardingRef,
  };

  const [render, animationController] = useTransition(
    cardAnimationsRef.current,
    {
      key: (c: CardAnimationState) => c.card.acquiredId,
      from: (c: CardAnimationState) => getDiscardPosition(c, context),
      enter: (c: CardAnimationState) => animate(c, context),
      update: (c: CardAnimationState) => animate(c, context),
    },
    [event],
  );

  // ensure we only handle the undo event once
  const handledEventRef = useRef<BattleEvent>();

  if (event?.type === 'undo' && handledEventRef.current !== event) {
    handledEventRef.current = event;
    animationController.stop();
    cardAnimationsRef.current.forEach((c) => {
      c.cancelWait?.('undo');
    });
  }

  if (isFastForwarding) {
    cardAnimationsRef.current.forEach((c) => {
      c.cancelWait?.('fast-forward');
    });
  }

  useEffect(() => {
    animationController.start();
  }, [animationController, event]);

  return render((style, { card }) => {
    return (
      <AnimatedContainer style={style}>
        <Card card={card} size="medium" />
      </AnimatedContainer>
    );
  });
}
