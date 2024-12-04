import { getNumCardAddPicks } from '../../../game/utils/selectors';
import { CardSelection } from './CardSelection';
import { GenericCardSelectionProps } from './CardSelectionScreen';

export function AddCardsScreen(props: GenericCardSelectionProps) {
  const numPicks = getNumCardAddPicks(props.game);
  return <CardSelection {...props} numCardSelections={numPicks} buttonText="Add" />;
}
