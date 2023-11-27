import { useEffect } from 'react';

import './GameEndScreen.css';

import { MAX_WINS } from '../state/game';
import { useGame, useActions } from './GameContext';
import ProgressDisplay from './ProgressDisplay';

export default function GameEndScreen() {
  const game = useGame();
  const { startGame } = useActions();

  const { input, wins } = game;

  useEffect(() => {
    if (input.actionKeyDown) {
      startGame();
    }
  }, [input.actionKeyDown, startGame]);

  const isWin = wins >= MAX_WINS;
  const title = isWin ? 'You win!' : 'Game Over';

  return (
    <div className="GameEndScreen">
      <div className="GameEndScreen-title">{title}</div>
      <ProgressDisplay />
    </div>
  );
}
