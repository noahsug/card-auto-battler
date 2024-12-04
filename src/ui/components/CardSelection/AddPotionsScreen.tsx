import { NUM_ADD_POTION_PICKS } from '../../../game/constants';
import { CardSelection } from './CardSelection';
import { GenericCardSelectionProps } from './CardSelectionScreen';

export function AddPotionsScreen(props: GenericCardSelectionProps) {
  return <CardSelection {...props} numCardSelections={NUM_ADD_POTION_PICKS} buttonText="Add" />;
}
