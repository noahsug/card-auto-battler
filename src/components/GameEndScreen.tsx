import { useEffect } from 'react';

import './GameEndScreen.css';

import { MAX_WINS, MAX_LOSSES } from '../state/game';
import { useGame, useActions } from './GameContext';

export default function GameEndScreen() {
  const game = useGame();
  const { startGame } = useActions();

  const { input, wins, losses } = game;

  useEffect(() => {
    if (input.actionKeyDown) {
      startGame();
    }
  }, [input.actionKeyDown, startGame]);

  const isWin = wins >= MAX_WINS;
  const title = isWin ? 'You win!' : 'Game Over';

  function getEndGameStatsMessage() {
    if (isWin) {
      const lives = new Array(MAX_LOSSES - losses).fill('❤️').join('');
      return `Lives: ${lives}`;
    }

    return `Wins: ${wins}/${MAX_WINS}`;
  }

  return (
    <div className="GameEndScreen">
      <div className="GameEndScreen-title">{title}</div>
      <div>{getEndGameStatsMessage()}</div>
    </div>
  );
}
