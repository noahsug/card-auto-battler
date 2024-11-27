import { NUM_CARD_REMOVAL_PICKS } from '../../../game/constants';
import { CardState, GameState } from '../../../game/gameState';
import { CardSelection, sortCards } from './CardSelection';

interface Props {
  game: GameState;
  onCardsSelected: (cards: CardState[]) => void;
  onViewDeck: () => void;
}

export function RemoveCardsScreen(props: Props) {
  const cards = sortCards(props.game.user.cards);

  return (
    <CardSelection
      {...props}
      cards={cards}
      numCardSelections={NUM_CARD_REMOVAL_PICKS}
      buttonText="Remove"
    />
  );
}
