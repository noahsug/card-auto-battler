import { NUM_POTION_SELECTION_PICKS } from '../../../game/constants';
import { CardSelection } from './CardSelection';
import { GenericCardSelectionProps } from './CardSelectionScreen';

export function AddPotionsScreen(props: GenericCardSelectionProps) {
  return (
    <CardSelection {...props} numCardSelections={NUM_POTION_SELECTION_PICKS} buttonText="Add" />
  );
}
