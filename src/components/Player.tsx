import './Player.css';

import Card from './Card';
import HealthBar from './HealthBar';
import { useGame } from './GameContext';
import { getIsOpponentTurn, getActiveCard } from '../state/game';

interface Props {
  isOpponent: boolean;
  forceInactive: boolean;
}

export default function Player({ isOpponent, forceInactive }: Props) {
  const game = useGame();

  const { opponent, user } = game;
  const player = isOpponent ? opponent : user;
  const { health, maxHealth } = player;

  const isOpponentTurn = getIsOpponentTurn(game);
  const isActive = !forceInactive && (isOpponent ? isOpponentTurn : !isOpponentTurn);

  const card = getActiveCard(game);

  let className = 'Player';
  if (isActive) {
    className += ' Player-active';
  }

  return (
    <div className={className}>
      <div className="Player-cardContainer">
        <Card card={card} />
      </div>
      <HealthBar health={health} maxHealth={maxHealth} />
    </div>
  );
}
