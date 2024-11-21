import { NUM_CARD_SELECTION_PICKS } from '../../../game/constants';
import { CardState, GameState } from '../../../game/gameState';
import { CardSelection } from './CardSelection';

interface Props {
  game: GameState;
  cards: CardState[];
  onCardsSelected: (selectedCardIndexes: number[]) => void;
  onViewDeck: () => void;
}

export function CardAddScreen(props: Props) {
  return <CardSelection {...props} numCardSelections={NUM_CARD_SELECTION_PICKS} buttonText="Add" />;
}
