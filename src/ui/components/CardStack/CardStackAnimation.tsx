import { useSpringRef, useTransition, animated, config, easings } from '@react-spring/web';
import { useRef, useEffect } from 'react';
import random from 'lodash/random';
import { styled } from 'styled-components';

import { CardState } from '../../../game/gameState';
import { BattleEvent, CardBattleEvent } from '../../../game/actions/battleEvent';
import { UnitFn, useUnits, WindowDimensions } from '../../hooks/useUnits';
import { Card } from '../Card';
import { assertIsNonNullable } from '../../../utils/asserts';
import { Direction } from '../../../utils/types';
import { Z_INDEX } from '../../constants';
import { wait } from '../../../utils/wait';

export interface Props {
  cards: CardState[];
  currentCardIndex: number;
  event: BattleEvent | undefined;
  onAnimationComplete: () => void;
  deckBoundingRect: DOMRect;
  opponentBoundingRect: DOMRect;
}

const AnimatedContainer = styled(animated.div)`
  position: absolute;
  inset: 0;
`;

interface CardAnimationState {
  cardId: number;
  rotation: number;
  deckIndex: number;
  inDiscard: boolean;
  isAnimating: boolean;
}

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
}

function syncZIndex(cardAnimation: CardAnimationState, context: AnimationContext) {
  cardAnimation.deckIndex = context.cards.findIndex((c) => c.acquiredId === cardAnimation.cardId);
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

function getDiscardPosition(cardAnimation: CardAnimationState, context: AnimationContext) {
  const cardDealDirection = getCardDealDirection(context);
  const reverseIndex = getReverseIndex(cardAnimation, context);
  return {
    x: context.windowDimensions.width * -cardDealDirection,
    y: 0,
    rotate: 0,
    scale: 1.5,
    opacity: 1,
    zIndex: Z_INDEX.cards + reverseIndex,
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
  const { cards, onCardAnimationComplete } = context;
  const reverseIndex = cards.length - 1 - cardAnimation.deckIndex;

  return async (next: (options: object) => Promise<void>) => {
    // set z-index
    const discardPosition = getDiscardPosition(cardAnimation, context);
    await next({
      ...discardPosition,
      immediate: true,
    });

    const deckPosition = getDeckPosition(cardAnimation, context);
    await next({
      ...deckPosition,
      delay: (reverseIndex * 300) / Math.sqrt(cards.length),
      config: config.default,
    });

    cardAnimation.inDiscard = false;
    onCardAnimationComplete(cardAnimation);
  };
}

function playCard(cardAnimation: CardAnimationState, context: AnimationContext) {
  const { onCardAnimationComplete } = context;

  const { x, y } = getXYToTarget(context);
  return async (next: (options: object) => Promise<void>) => {
    // const deckPosition = getDeckPosition(cardAnimation, context);
    // await next({
    //   ...deckPosition,
    //   immediate: true,
    // });

    await next({ x, y, scale: 1.25, rotate: 0, config: { ...config.stiff } });
    await wait(500);
    onCardAnimationComplete(cardAnimation);
  };
}

function discardCard(cardAnimation: CardAnimationState, context: AnimationContext) {
  const { u, onCardAnimationComplete } = context;

  return async (next: (options: object) => Promise<void>) => {
    await next({ y: u(-1000), rotate: 0, config: { duration: 300, easing: easings.easeInBack } });

    const discardPosition = getDiscardPosition(cardAnimation, context);
    await next({ ...discardPosition, config: { duration: 0 } });

    cardAnimation.inDiscard = true;
    onCardAnimationComplete(cardAnimation);
  };
}

function trashCard(cardAnimation: CardAnimationState, context: AnimationContext) {
  const { onCardAnimationComplete } = context;

  return async (next: (options: object) => Promise<void>) => {
    await next({ opacity: 0, config: config.default });

    onCardAnimationComplete(cardAnimation);
  };
}

function animate(cardAnimation: CardAnimationState, context: AnimationContext) {
  const { event } = context;
  if (!event) {
    cardAnimation.isAnimating = false;
    return null;
  }

  cardAnimation.isAnimating = true;

  if ((event as CardBattleEvent).cardId === cardAnimation.cardId) {
    switch (event.type) {
      case 'playCard':
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
    syncZIndex(cardAnimation, context);
    return dealCard(cardAnimation, context);
  }

  cardAnimation.isAnimating = false;
  return null;
}

export function CardStackAnimation({
  cards,
  currentCardIndex,
  event,
  onAnimationComplete,
  deckBoundingRect,
  opponentBoundingRect,
}: Props) {
  const [u, windowDimensions] = useUnits();

  const cardAnimationsRef = useRef<CardAnimationState[]>(
    cards.map((card, i) => createCardAnimationState(card, i, currentCardIndex)),
  );

  const onCardAnimationComplete = (cardAnimation: CardAnimationState) => {
    cardAnimation.isAnimating = false;
    const animationsComplete = cardAnimationsRef.current.every((c) => !c.isAnimating);
    if (animationsComplete) {
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
  };

  const [render, animationController] = useTransition(
    cardAnimationsRef.current,
    {
      key: (c: CardAnimationState) => c.cardId,
      from: (c: CardAnimationState) => getDiscardPosition(c, context),
      enter: (c: CardAnimationState) => animate(c, context),
      update: (c: CardAnimationState) => animate(c, context),
    },
    [event],
  );

  useEffect(() => {
    animationController.start();
  }, [animationController, event]);

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
