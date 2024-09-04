import { PlayerState } from '../gameState';
import shuffle from 'lodash/shuffle';

function maybeShuffleDiscardIntoDeck(player: PlayerState) {
  if (player.currentCardIndex >= player.cards.length) {
    player.currentCardIndex = 0;
    player.cards = shuffle(player.cards);
  }
}

export function discardCurrentCard(player: PlayerState) {
  if (player.cards.length === 0) return;
  player.currentCardIndex += 1;
  maybeShuffleDiscardIntoDeck(player);
}

export function trashCurrentCard(player: PlayerState) {
  const [trashedCard] = player.cards.splice(player.currentCardIndex, 1);
  player.trashedCards.push(trashedCard);
  maybeShuffleDiscardIntoDeck(player);
}

function trashNextCard({
  player,
  isActivePlayer,
}: {
  player: PlayerState;
  isActivePlayer: boolean;
}) {
  if (isActivePlayer && player.currentCardIndex >= player.cards.length - 1) {
    // shuffle the discard while preserving the active card
    const activeCard = player.cards.pop()!;
    maybeShuffleDiscardIntoDeck(player);
    player.cards.unshift(activeCard);
    player.currentCardIndex = 0;
  }

  const trashIndex = player.currentCardIndex + (isActivePlayer ? 1 : 0);
  const [trashedCard] = player.cards.splice(trashIndex, 1);
  player.trashedCards.push(trashedCard);
  maybeShuffleDiscardIntoDeck(player);
}

export function trashNextCards({
  player,
  isActivePlayer,
  numCardsToTrash,
}: {
  player: PlayerState;
  isActivePlayer: boolean;
  numCardsToTrash: number;
}) {
  if (player.cards.length <= numCardsToTrash) {
    // trash all cards
    player.trashedCards.push(...player.cards);
    player.cards = [];
    player.currentCardIndex = 0;
    return;
  }

  for (let i = 0; i < numCardsToTrash; i++) {
    trashNextCard({ player, isActivePlayer });
  }
}
