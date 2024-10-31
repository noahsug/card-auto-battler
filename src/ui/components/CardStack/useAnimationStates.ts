import { useCallback, useRef, useState } from 'react';
import random from 'lodash/random';

import { CardState } from '../../../game/gameState';
import { BattleEvent } from '../../../game/actions/battleEvent';
import { assertIsNonNullable } from '../../../utils/asserts';

/**
 * pass in
 *  - last action taken: "battleStart", "cardPlayed", "opponentCardPlayed", "undo"
 *  - isPaused boolean
 *  - isFastForwarded boolean - TODO later
 *
 * pause stops the animation queue from progressing, cards are always auto played, next becomes fast forward
 *  - undo = instantly jump to current animation state
 *  - play/pause = resume/pause animation queue
 *  - fast forward = play animations and cards faster
 *
 * game starts with a huge play button (and no undo or next), see dancing duelists
 *
 * call this useAnimationQueue, maps cardID -> animationState, has a next() and clear() method
 *  - animationQueue = [
 *     { 1: 'play' },
 *     { 1: 'discard', 2: 'trash' }
 *    ]
 * - animationQueue = [
 *     { 1: 'play' },
 *     { 1: 'discard' },
 *     { 1...last: 'deal cards' },
 *     { 2: 'trash' },
 *    ]
 */

type Animation = 'discarded' | 'inDeck' | 'playing' | 'played' | 'trashed';

export interface CardAnimationState {
  animationQueue: Animation[];
  cardId: number;
}

interface Props {
  cards: CardState[];
  currentCardIndex: number;
  battleEvents: BattleEvent[];
}

// function getCardAnimationState(card: CardState, { cards, currentCardIndex, battleEvents }: Props) {
//   const cardAnimationState: CardAnimationState = {
//     animationQueue: [],
//     id: card.acquiredId,
//   };

//   const cardPlayedEvent = battleEvents.find((event) => event.type === 'cardPlayed');
//   const shuffledEvent = battleEvents.find((event) => event.type === 'shuffled');

//   if (cardPlayedEvent && cardPlayedEvent.cardId === card.acquiredId) {
//     cardAnimationState.animationQueue.push('played');
//   }

//   const index = cards.findIndex((c) => c.acquiredId === card.acquiredId);
//   if (index === -1) {
//     cardAnimationState.animationQueue.push('trashed');
//   } else if (index < currentCardIndex) {
//     cardAnimationState.animationQueue.push('inDeck');
//   } else {
//     cardAnimationState.animationQueue.push('discarded');
//   }
// }

function createCardAnimationState(card: CardState): CardAnimationState {
  return {
    animationQueue: [],
    cardId: card.acquiredId,
  };
}

// TODO:
// undo = call clearPreviousState which is a function passed to BattleScreen?
//
// battleEvents includes cardPlayed, shuffle, trashed
//
// remove source from battle events, as we can see when the card is played to determine if the
// animation should wait or not
export function useCardAnimationStates({ cards, currentCardIndex, battleEvents }: Props) {
  const animationQueue = [];

  let cardToDiscard: number | null = null;

  battleEvents.forEach((event) => {
    switch (event.type) {
      case 'cardPlayed':
        animationQueue.push({ type: 'playCard', id: event.cardId });
        cardToDiscard = event.cardId;
        break;

      case 'cardTrashed':
        animationQueue.push({ type: 'trashCard', id: event.cardId });
        break;

      case 'shuffled':
        if (cardToDiscard) {
          // play the discard animation before redealing the deck
          animationQueue.push({ type: 'discardCard', id: cardToDiscard });
          cardToDiscard = null;
        }
        animationQueue.push({ type: 'dealCards' });
        break;
    }
  });

  // const animationStatesRef = useRef(cards.map(createCardAnimationState));

  // animationStatesRef.current.forEach((animationState) => {
  //   const card = cards.find((card) => card.acquiredId === animationState.cardID);
  //   if (!card) createCardAnimationStates(
  // });

  // const animationQueueRef = useRef<Record<string, AnimationState>[]>([]);

  // const newAnimationStates = getNewAnimationStates({
  //   currentAnimationStates: animationStates,
  //   cards,
  //   trashedCards,
  // });
  // if (newAnimationStates.length > 0) {
  //   setAnimationStates((prev) => [...prev, ...newAnimationStates]);
  // }

  return animationStates;
}
