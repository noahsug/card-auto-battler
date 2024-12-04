import { useState } from 'react';
import { NUM_FEATHER_CARD_PICKS } from '../../../game/constants';
import { CardSelection, sortCards } from './CardSelection';
import { GenericCardSelectionProps } from './CardSelectionScreen';
import { addFeatherCharm } from '../../../game/utils/cards';

// TODO: Show feather on card when selected (to show it replaces anchor)
export function FeatherCardsScreen(props: GenericCardSelectionProps) {
  const [selectedCardIndexes, setSelectedCardIndexes] = useState<number[]>([]);

  const cards = sortCards(structuredClone(props.cards));
  selectedCardIndexes.forEach((index) => {
    const card = cards[index];
    addFeatherCharm(card);
  });

  return (
    <CardSelection
      {...props}
      cards={cards}
      numCardSelections={NUM_FEATHER_CARD_PICKS}
      buttonText="Lighten"
      onCardSelectionChange={setSelectedCardIndexes}
    />
  );
}
