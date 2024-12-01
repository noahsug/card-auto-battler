import { NUM_CARD_REMOVAL_PICKS } from '../../../game/constants';
import { CardSelection, sortCards } from './CardSelection';
import { GenericCardSelectionProps } from './CardSelectionScreen';

export function RemoveCardsScreen(props: GenericCardSelectionProps) {
  const cards = sortCards(props.cards);

  return (
    <CardSelection
      {...props}
      cards={cards}
      numCardSelections={NUM_CARD_REMOVAL_PICKS}
      buttonText="Remove"
    />
  );
}
