import './Player.css';
import Card from './Card';
import HealthBar from './HealthBar';

import { PlayerState, getActiveCard } from '../state';

export default function Player({ player }: { player: PlayerState }) {
  const card = getActiveCard(player);
  const { health, maxHealth } = player;

  return (
    <div className="Player">
      <Card card={card} />
      <HealthBar health={health} maxHealth={maxHealth} />
    </div>
  );
}
