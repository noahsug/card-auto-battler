import { NUM_REMOVE_CARD_PICKS } from '../../../game/constants';
import { CardSelection, sortCards } from './CardSelection';
import { GenericCardSelectionProps } from './CardSelectionScreen';

export function RemoveCardsScreen(props: GenericCardSelectionProps) {
  const cards = sortCards(props.cards);

  return (
    <CardSelection
      {...props}
      cards={cards}
      numCardSelections={NUM_REMOVE_CARD_PICKS}
      buttonText="Remove"
    />
  );
}
