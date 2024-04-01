import { CARD_SELECTION_OPTIONS, CARD_SELECTION_PICKS } from '../../src/gameState/constants';

// returns the edit distance between two string arrays of equal length, where the elements are
// sorted in priority order from highest priority to lowest priority.
function getPriorityEditDistance(a: string[], b: string[]) {
  //
  // 4 rounds, 6 cards in selections, 36 cards total
}

function getPriorityDistanceImpact(from: number, to: number) {
  // CARD_SELECTION_OPTIONS;
  // CARD_SELECTION_PICKS;
}

function getExpectedNumSelections({
  cardPriority,
  numTotalCards,
  numCardsAvailableToSelect,
  nunCardSelections,
}) {}

(() => {
  const T = 37;
  const S = 6;
  const N = 2;

  const iterations = 1000000;

  for (let i = 0; i < T; i++) {
    expectedCardsByPriority(i);
  }

  function expectedCardsByPriority(P: number) {
    let totalPSelections = 0;

    for (let i = 0; i < iterations; i++) {
      const cards: number[] = [];
      for (let cardIndex = 0; cardIndex < S; cardIndex++) {
        const card = Math.floor(Math.random() * T);
        cards.push(card);
      }

      cards.sort((a, b) => a - b);
      const selection = cards.slice(0, N);
      totalPSelections += selection.filter((c) => c === P).length;
    }

    const result = totalPSelections / iterations;
    console.log(result);
  }
})();
