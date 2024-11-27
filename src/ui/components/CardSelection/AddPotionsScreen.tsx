import { NUM_POTION_SELECTION_PICKS } from '../../../game/constants';
import { CardState, GameState } from '../../../game/gameState';
import { CardSelection } from './CardSelection';

interface Props {
  game: GameState;
  cards: CardState[];
  onCardsSelected: (cards: CardState[]) => void;
  onViewDeck: () => void;
}

export function AddPotionsScreen(props: Props) {
  return (
    <CardSelection {...props} numCardSelections={NUM_POTION_SELECTION_PICKS} buttonText="Add" />
  );
}
