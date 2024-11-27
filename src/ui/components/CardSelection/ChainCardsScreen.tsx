import { useState } from 'react';

import { breakChain, getChainCreatesLoop } from '../../../game/actions/applyCardOrderingEffects';
import { CardState, GameState } from '../../../game/gameState';
import { CardSelection, sortCards } from './CardSelection';

interface Props {
  game: GameState;
  onCardsSelected: (selectedCardIndexes: number[]) => void;
  onViewDeck: () => void;
}

// returns card indexes that would create a loop if chained
function getInvalidSelectionsIndexes(cards: CardState[], selectedCardIndexes: number[]): number[] {
  if (selectedCardIndexes.length !== 1) return [];
  const [fromIndex] = selectedCardIndexes;

  const invalidSelections: number[] = [];
  for (let toIndex = 0; toIndex < cards.length; toIndex++) {
    if (toIndex !== fromIndex && getChainCreatesLoop(cards, fromIndex, toIndex)) {
      invalidSelections.push(toIndex);
    }
  }

  return invalidSelections;
}

export function ChainCardsScreen(props: Props) {
  const [selectedCardIndexes, setSelectedCardIndexes] = useState<number[]>([]);

  // copy cards because we're changing their chain IDs as the user selects/de-selects cards
  const cards = sortCards(structuredClone(props.game.user.cards));

  // mark selected cards as chained
  const [fromCard, toCard] = selectedCardIndexes.map((index) => cards[index]);
  if (fromCard) breakChain(fromCard, 'toId', cards);
  if (toCard) breakChain(toCard, 'fromId', cards);

  const invalidSelections = getInvalidSelectionsIndexes(cards, selectedCardIndexes);

  // set the chain IDs, or add a mock acquiredId so half the chain shows up in the UI
  if (fromCard) fromCard.chain.toId = toCard?.acquiredId || -1;
  if (toCard) toCard.chain.fromId = fromCard?.acquiredId || -1;

  return (
    <CardSelection
      {...props}
      cards={cards}
      invalidSelections={invalidSelections}
      numCardSelections={2}
      buttonText="Chain"
      onCardSelectionChange={setSelectedCardIndexes}
    />
  );
}
