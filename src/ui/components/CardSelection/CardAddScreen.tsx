import { NUM_CARD_SELECTION_PICKS, NUM_FIRST_CARD_SELECTION_PICKS } from '../../../game/constants';
import { CardState, GameState } from '../../../game/gameState';
import { CardSelection } from './CardSelection';

interface Props {
  game: GameState;
  cards: CardState[];
  onCardsSelected: (selectedCardIndexes: number[]) => void;
  onViewDeck: () => void;
}

export function CardAddScreen(props: Props) {
  const numPicks =
    props.game.wins === 0 ? NUM_FIRST_CARD_SELECTION_PICKS : NUM_CARD_SELECTION_PICKS;
  return <CardSelection {...props} numCardSelections={numPicks} buttonText="Add" />;
}
