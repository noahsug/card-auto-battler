import { NUM_CARD_FEATHER_PICKS } from '../../../game/constants';
import { CardSelection, sortCards } from './CardSelection';
import { GenericCardSelectionProps } from './CardSelectionScreen';

// TODO: Show feather on card when selected (to show it replaces anchor)
export function FeatherCardsScreen(props: GenericCardSelectionProps) {
  const cards = sortCards(props.cards);

  return (
    <CardSelection
      {...props}
      cards={cards}
      numCardSelections={NUM_CARD_FEATHER_PICKS}
      buttonText="Lighten"
    />
  );
}
