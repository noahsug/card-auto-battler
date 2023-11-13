import './Player.css';
import Card from './Card';
import HealthBar from './HealthBar';
import { PlayerIndex } from '../state/game';
import { useGame } from './GameContext';

type Props = { playerIndex: PlayerIndex };

export default function Player({ playerIndex }: Props) {
  const { health, maxHealth } = useGame((game) => game.players[playerIndex]);

  return (
    <div className="Player">
      <Card />
      <HealthBar health={health} maxHealth={maxHealth} />
    </div>
  );
}
