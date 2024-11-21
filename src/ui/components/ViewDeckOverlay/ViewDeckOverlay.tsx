import sortBy from 'lodash/sortBy';

import { GameState } from '../../../game/gameState';
import { CardSelection } from '../CardSelection';

interface Props {
  game: GameState;
  onClose: () => void;
}

export function ViewDeckOverlay({ game, onClose }: Props) {
  const cards = sortBy(game.user.cards, (card) => card.acquiredId);

  return <CardSelection game={game} onCardsSelected={onClose} cards={cards} buttonText="Close" />;
}
