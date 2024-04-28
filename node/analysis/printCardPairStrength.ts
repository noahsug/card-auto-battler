import {
  MAX_WINS,
  NUM_STARTING_CARDS,
  damageStarterCard,
  createInitialGameState,
  CardState,
  GameState,
  nonStarterCards,
} from '../../src/gameState';
import { startCardSelection, addCard, startBattle, endBattle } from '../../src/gameState/actions';
import { NUM_CARD_SELECTION_PICKS } from '../../src/gameState/constants';
import { runBattle } from './runGame';
import { percent } from '../../src/utils';
import { getCachedFn, hashValues } from './cache';

const ITERATIONS = 5000;

const FILLER_CARD = damageStarterCard;

export default function printCardPairStrength() {
  function getWinRate(cards: CardState[]) {
    const fillerCard = FILLER_CARD;
    return cachedGetCardsWinRate({ cards, fillerCard });
  }

  const results = [] as any[];

  for (let i = 0; i < nonStarterCards.length - 1; i++) {
    for (let j = i + 1; j < nonStarterCards.length; j++) {
      // i = 0; // damageCard
      // j = 3; // bleedCard
      // i = 17; // damageForEachBleedCard
      // i = 18; // tripleBleedCard
      // i = 13; // lifestealCard;
      // j = 20; // bothBleedCard

      const cardA = nonStarterCards[i];
      const cardB = nonStarterCards[j];

      const cardAWinRate = getWinRate([cardA, cardA]);
      const cardBWinRate = getWinRate([cardB, cardB]);
      const pairWinRate = getWinRate([cardA, cardB]);

      const positiveSynergy = pairWinRate - Math.max(cardAWinRate, cardBWinRate);
      const negativeSynergy = pairWinRate - Math.min(cardAWinRate, cardBWinRate);
      let synergyScore = 0;
      if (positiveSynergy > 0) {
        synergyScore = positiveSynergy;
      } else if (negativeSynergy < 0) {
        synergyScore = negativeSynergy;
      }

      if (synergyScore) {
        console.log('');
        console.log(
          cardA.name,
          percent(cardAWinRate, 1),
          '&',
          cardB.name,
          percent(cardBWinRate, 1),
          '=',
          percent(synergyScore, 1),
          `(${percent(pairWinRate, 1)})`,
        );
        results.push({ cardA, cardB, synergyScore });
      }
      // break;
    }
    // break;
  }

  results
    .sort((a, b) => a.synergyScore - b.synergyScore)
    .forEach(({ cardA, cardB, synergyScore }, i) => {
      console.log(i, cardA.name, '&', cardB.name, percent(synergyScore, 1));
    });
}

const cachedGetCardsWinRate = getCachedFn(getCardsWinRate, {
  getCacheKey: getCardsWinRateCacheKey,
  name: 'getCardsWinRate',
});

function getCardsWinRateCacheKey({
  cards,
  fillerCard,
}: {
  cards: CardState[];
  fillerCard: CardState;
}) {
  return hashValues({
    values: [
      ...cards.map((card) => JSON.stringify(card)).sort(),
      JSON.stringify(fillerCard),
      ITERATIONS,
    ],
  });
}

function getCardsWinRate({ cards, fillerCard }: { cards: CardState[]; fillerCard: CardState }) {
  let numWins = 0;

  for (let i = 0; i < ITERATIONS; i++) {
    const userCards = getUserCards({ cards, fillerCard });
    const { isWin } = runSimulation({ userCards });
    if (isWin) {
      numWins += 1;
    }
  }

  return numWins / ITERATIONS;
}

function getUserCards({ cards, fillerCard }: { cards: CardState[]; fillerCard: CardState }) {
  const userCards = cards.slice();

  // we need extra filler cards if cards.length is not a multiple of NUM_CARD_SELECTION_PICKS
  const extraFillerCards =
    (NUM_CARD_SELECTION_PICKS - (cards.length % NUM_CARD_SELECTION_PICKS)) %
    NUM_CARD_SELECTION_PICKS;
  const numFillerCards = NUM_STARTING_CARDS + extraFillerCards;

  for (let i = 0; i < numFillerCards; i++) {
    userCards.push(fillerCard);
  }

  return userCards;
}

function runSimulation({ userCards }: { userCards: CardState[] }) {
  const remainingUserCards = userCards.slice();

  const game = createInitialGameState();
  game.user.cards = remainingUserCards.splice(0, NUM_STARTING_CARDS);

  while (remainingUserCards.length > 0) {
    startCardSelection(game);
    const picks = remainingUserCards.splice(0, NUM_CARD_SELECTION_PICKS);
    picks.forEach((card) => addCard(game, card));

    if (remainingUserCards.length > 0) {
      runFakeBattle(game);
    }
  }

  const previousWins = game.wins;
  runBattle(game);
  return { game, isWin: game.wins > previousWins };
}

function runFakeBattle(game: GameState) {
  startBattle(game);

  // user wins unless they're one win away from ending the game
  const isUserWin = game.wins < MAX_WINS - 1;
  if (isUserWin) {
    game.enemy.health = 0;
  } else {
    game.user.health = 0;
  }

  endBattle(game);
}
