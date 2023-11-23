import { useEffect } from 'react';

import './BattleScreen.css';

import { useGame, useGameDispatch } from './GameContext';
import Player from './Player';

export default function BattleScreen() {
  const { turn } = useGame();
  const dispatch = useGameDispatch();

  // take turns every 2 seconds
  useEffect(() => {
    const nextTurn = () => dispatch({ type: 'NEXT_TURN' });
    const timeout = setTimeout(nextTurn, 2000);
    return () => clearInterval(timeout);
  }, [dispatch, turn]);

  return (
    <div className="BattleScreen">
      <Player isOpponent={true} />
      <div className="BattleScreen-divider" />
      <Player isOpponent={false} />
    </div>
  );
}
