import { useEffect } from 'react';

import './BattleScreen.css';

import { useGame, useActions } from './GameContext';
import Player from './Player';

export default function BattleScreen() {
  const { turn } = useGame();
  const { nextTurn } = useActions();

  // take turns every 2 seconds
  useEffect(() => {
    const timeout = setTimeout(nextTurn, 2000);
    return () => clearInterval(timeout);
  }, [nextTurn, turn]);

  return (
    <div className="BattleScreen">
      Turn: {turn}
      <Player isOpponent={true} />
      <div className="BattleScreen-divider" />
      <Player isOpponent={false} />
    </div>
  );
}
