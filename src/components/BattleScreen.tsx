import './BattleScreen.css';
import Card from './Card';
import HealthBar from './HealthBar';

import { BattleScreenState, getActiveCard } from '../state';

type Props = { playerIndex: number };

export default function BattleScreen({ playerIndex }: Props) {

  const { health, maxHealth } = player;

  return (
    <div className="BattleScreen">
      <Card />
      <HealthBar health={health} maxHealth={maxHealth} />
    </div>
  );
}
