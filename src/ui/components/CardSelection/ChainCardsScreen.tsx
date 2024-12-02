import { useState } from 'react';

import { breakChain, getChainCreatesLoop } from '../../../game/utils/cards';
import { CardState } from '../../../game/gameState';
import { CardSelection, sortCards } from './CardSelection';
import { GenericCardSelectionProps } from './CardSelectionScreen';
import { NUM_CARD_CHAIN_PICKS } from '../../../game/constants';

// returns card indexes that would create a loop if chained
function getInvalidSelectionsIndexes(cards: CardState[], fromIndex: number): number[] {
  const invalidSelections: number[] = [];
  for (let toIndex = 0; toIndex < cards.length; toIndex++) {
    if (toIndex !== fromIndex && getChainCreatesLoop(cards, fromIndex, toIndex)) {
      invalidSelections.push(toIndex);
    }
  }

  return invalidSelections;
}

export function ChainCardsScreen(props: GenericCardSelectionProps) {
  const [selectedCardIndexes, setSelectedCardIndexes] = useState<number[]>([]);

  // copy cards because we're changing their chain IDs as the user selects/de-selects cards
  const cards = sortCards(structuredClone(props.cards));

  // mark selected cards as chained
  const [fromCard, toCard] = selectedCardIndexes.map((index) => cards[index]);
  if (fromCard) breakChain(fromCard, 'toId', cards);
  if (toCard) breakChain(toCard, 'fromId', cards);

  // when the user has selected one card, mark the cards that they can't select because it
  // would create a chain loop
  const invalidSelections =
    selectedCardIndexes.length === 1
      ? getInvalidSelectionsIndexes(cards, selectedCardIndexes[0])
      : [];

  // set the chain IDs, or add a mock acquiredId so half the chain shows up in the UI
  if (fromCard) fromCard.chain.toId = toCard?.acquiredId || -1;
  if (toCard) toCard.chain.fromId = fromCard?.acquiredId || -1;

  return (
    <CardSelection
      {...props}
      cards={cards}
      invalidSelections={invalidSelections}
      numCardSelections={NUM_CARD_CHAIN_PICKS}
      buttonText="Chain"
      onCardSelectionChange={setSelectedCardIndexes}
    />
  );
}
