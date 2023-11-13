import './Player.css';
import Card from './Card';
import HealthBar from './HealthBar';
import { useGame } from './GameContext';

type Props = { isOpponent: boolean };

export default function Player({ isOpponent }: Props) {
  const player = useGame((game) => isOpponent ? game.opponent : game.user);
  const { health, maxHealth, cards, activeCard } = player;

  return (
    <div className="Player">
      <Card card={cards[activeCard]} />
      <HealthBar health={health} maxHealth={maxHealth} />
    </div>
  );
}
