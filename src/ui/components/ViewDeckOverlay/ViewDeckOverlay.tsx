import { GameState } from '../../../game/gameState';
import { CardSelection } from '../CardSelection';
import { sortCards } from '../CardSelection/CardSelection';

interface Props {
  game: GameState;
  onClose: () => void;
}

export function ViewDeckOverlay({ game, onClose }: Props) {
  const cards = sortCards(game.user.cards.concat(game.user.trashedCards));

  return <CardSelection game={game} onCardsSelected={onClose} cards={cards} buttonText="Close" />;
}
