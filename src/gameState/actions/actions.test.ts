import clonedeep from 'lodash/clonedeep';
import merge from 'lodash/merge';

import { endTurn, playCard, startGame, startBattle, startTurn } from './actions';
import { createInitialGameState } from '../';
import {
  CardState,
  PlayerState,
  getCanPlayCard,
  getIsBattleOver,
  getIsOpponentTurn,
} from '../gameState';

function runBattle({
  user,
  opponent,
  stopAfter,
}: {
  user?: Partial<PlayerState>;
  opponent?: Partial<PlayerState>;
  stopAfter?: { userCardsPlayed: true } | { turn: number };
}) {
  const game = merge(createInitialGameState(), { user, opponent });

  startGame(game);
  startBattle(game);

  const startingState = clonedeep(game);

  // unshuffle the cards
  if (user?.cards) {
    game.user.cards = user.cards;
  }
  if (opponent?.cards) {
    game.opponent.cards = opponent.cards;
  }

  const stopAfterTurn = stopAfter && 'turn' in stopAfter ? stopAfter.turn : Infinity;
  const stopAfterUserCardsPlayed =
    stopAfter && 'userCardsPlayed' in stopAfter ? game.user.cards.length : Infinity;

  let userCardsPlayed = 0;

  while (
    !getIsBattleOver(game) &&
    game.turn < stopAfterTurn &&
    userCardsPlayed < stopAfterUserCardsPlayed
  ) {
    startTurn(game);

    while (
      !getIsBattleOver(game) &&
      getCanPlayCard(game) &&
      userCardsPlayed < stopAfterUserCardsPlayed
    ) {
      playCard(game);
      if (!getIsOpponentTurn(game)) {
        userCardsPlayed++;
      }
    }

    endTurn(game);
  }

  return { endingState: game, startingState };
}

describe('damage effect', () => {
  it('reduces health', () => {
    const userCards: CardState[] = [{ target: { damage: 1 } }];
    const { endingState, startingState } = runBattle({
      user: { cards: userCards },
      stopAfter: { userCardsPlayed: true },
    });

    expect(startingState.opponent.health - endingState.opponent.health).toBe(1);
  });
});

describe('dodge effect', () => {
  it('dodges the next source of damage', () => {
    const userCards: CardState[] = [{ self: { statusEffects: { dodge: 1 } } }];
    const opponentCards: CardState[] = [{ target: { damage: 1 } }];
    const { endingState, startingState } = runBattle({
      user: { cards: userCards },
      opponent: { cards: opponentCards },
      stopAfter: { userCardsPlayed: true },
    });

    expect(startingState.user.health).toBe(endingState.user.health);
  });
});

describe('bleed status effect', () => {
  it('is decreased when damage is delt', () => {
    const userCards: CardState[] = [
      { target: { statusEffects: { bleed: 2 } } },
      { target: { damage: 1 } },
      { target: { damage: 1 } },
      { target: { damage: 1 } },
    ];
    const opponentCards: CardState[] = [{ target: { damage: 0 } }];
    const { endingState, startingState } = runBattle({
      user: { cards: userCards },
      opponent: { cards: opponentCards, maxHealth: 10 },
      stopAfter: { userCardsPlayed: true },
    });

    expect(startingState.opponent.health - endingState.opponent.health).toBe(9);
  });

  it('does not apply to damage delt at the same time as bleed is applied', () => {
    const userCards: CardState[] = [{ target: { damage: 1, statusEffects: { bleed: 1 } } }];
    const { endingState, startingState } = runBattle({
      user: { cards: userCards },
      stopAfter: { userCardsPlayed: true },
    });

    expect(startingState.opponent.health - endingState.opponent.health).toBe(1);
  });
});

describe('multihit effect', () => {
  it('deals damage twice', () => {
    const userCards: CardState[] = [{ target: { damage: 1, multihit: 1 } }];
    const { endingState, startingState } = runBattle({
      user: { cards: userCards },
      stopAfter: { userCardsPlayed: true },
    });

    expect(startingState.opponent.health - endingState.opponent.health).toBe(2);
  });
  it('applies effects twice', () => {
    const userCards: CardState[] = [{ target: { statusEffects: { bleed: 1 }, multihit: 1 } }];
    const { endingState } = runBattle({
      user: { cards: userCards },
      stopAfter: { userCardsPlayed: true },
    });

    expect(endingState.opponent.statusEffects.bleed).toBe(2);
  });
});

describe('extraCardPlays status effect', () => {
  it('plays an extra card', () => {
    const userCards: CardState[] = [
      { target: { damage: 1 }, self: { statusEffects: { extraCardPlays: 1 } } },
      { target: { damage: 1 } },
      { target: { damage: 10 } }, // should not be played
    ];
    const { endingState, startingState } = runBattle({
      user: { cards: userCards },
      stopAfter: { turn: 1 },
    });

    expect(startingState.opponent.health - endingState.opponent.health).toBe(2);
  });
});
