import cloneDeep from 'lodash/cloneDeep';
import { useState } from 'react';

import { GameState } from '../../../game/gameState';
import { CardSelection } from './CardSelection';

interface Props {
  game: GameState;
  onCardsSelected: (selectedCardIndexes: number[]) => void;
  onViewDeck: () => void;
}

export function CardChainScreen(props: Props) {
  const [selectedCardIndexes, setSelectedCardIndexes] = useState<number[]>([]);
  const cards = cloneDeep(props.game.user.cards);

  // mark selected cards as chained
  const fromCard = cards[selectedCardIndexes[0]];
  const toCard = cards[selectedCardIndexes[1]];
  if (fromCard) fromCard.chain.toId = toCard?.acquiredId || -1;
  if (toCard) toCard.chain.fromId = fromCard?.acquiredId || -1;

  return (
    <CardSelection
      {...props}
      cards={cards}
      numCardSelections={2}
      buttonText="Chain"
      onCardSelectionChange={setSelectedCardIndexes}
    />
  );
}
