import { useState } from 'react';
import { NUM_CARD_FEATHER_PICKS } from '../../../game/constants';
import { CardSelection, sortCards } from './CardSelection';
import { GenericCardSelectionProps } from './CardSelectionScreen';

// TODO: Show feather on card when selected (to show it replaces anchor)
export function FeatherCardsScreen(props: GenericCardSelectionProps) {
  const [selectedCardIndexes, setSelectedCardIndexes] = useState<number[]>([]);

  const cards = sortCards(structuredClone(props.cards));
  selectedCardIndexes.forEach((index) => {
    const card = cards[index];
    card.charm = 'feather';
  });

  return (
    <CardSelection
      {...props}
      cards={cards}
      numCardSelections={NUM_CARD_FEATHER_PICKS}
      buttonText="Lighten"
      onCardSelectionChange={setSelectedCardIndexes}
    />
  );
}
