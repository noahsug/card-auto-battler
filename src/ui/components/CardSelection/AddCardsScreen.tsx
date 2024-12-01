import { NUM_CARD_SELECTION_PICKS, NUM_FIRST_CARD_SELECTION_PICKS } from '../../../game/constants';
import { CardSelection } from './CardSelection';
import { GenericCardSelectionProps } from './CardSelectionScreen';

export function AddCardsScreen(props: GenericCardSelectionProps) {
  const numPicks =
    props.game.wins === 0 ? NUM_FIRST_CARD_SELECTION_PICKS : NUM_CARD_SELECTION_PICKS;
  return <CardSelection {...props} numCardSelections={numPicks} buttonText="Add" />;
}
