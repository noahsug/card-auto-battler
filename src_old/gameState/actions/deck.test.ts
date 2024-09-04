import { PlayerState, createInitialGameState, getCurrentCard } from '../gameState';
import { discardCurrentCard, trashCurrentCard, trashNextCards } from './deck';
import { createCard } from '../utils';

let player: PlayerState;
const [c1, c2, c3] = [createCard(), createCard(), createCard()];

beforeEach(() => {
  const { user } = createInitialGameState();
  user.cards = [c1, c2, c3];
  player = user;
});

describe('discardCurrentCard', () => {
  it('discards the current card', () => {
    discardCurrentCard(player);

    expect(getCurrentCard(player)).toBe(c2);
  });

  it('shuffled the discard back into the deck after discarding the last card', () => {
    discardCurrentCard(player);
    discardCurrentCard(player);
    discardCurrentCard(player);

    expect(player.currentCardIndex).toBe(0);
  });
});

describe('trashCurrentCard', () => {
  it('trashes the current card', () => {
    trashCurrentCard(player);

    expect(getCurrentCard(player)).toBe(c2);
    expect(player.trashedCards).toEqual([c1]);
  });
});

describe('trashNextCards', () => {
  it('trashes the next card of the active player', () => {
    trashNextCards({ player, isActivePlayer: true, numCardsToTrash: 1 });

    expect(getCurrentCard(player)).toBe(c1);
    expect(player.trashedCards).toEqual([c2]);
  });

  it('trashes the next card of the non-active player', () => {
    trashNextCards({ player, isActivePlayer: false, numCardsToTrash: 1 });

    expect(getCurrentCard(player)).toBe(c2);
    expect(player.trashedCards).toEqual([c1]);
  });

  it('trashes multiple next cards', () => {
    player.currentCardIndex = 1;
    trashNextCards({ player, isActivePlayer: true, numCardsToTrash: 2 });

    expect(player.cards).toEqual([c2]);
    expect(player.trashedCards).toContain(c1);
    expect(player.trashedCards).toContain(c2);
  });

  it('trashes the entire deck', () => {
    player.currentCardIndex = 1;
    trashNextCards({ player, isActivePlayer: true, numCardsToTrash: 5 });

    expect(player.cards).toEqual([]);
    expect(player.trashedCards).toContain(c1);
    expect(player.trashedCards).toContain(c2);
    expect(player.trashedCards).toContain(c3);
  });
});
