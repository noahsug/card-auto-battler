import { useEffect } from 'react';

import './GameStartScreen.css';

import { useGame, useActions } from './GameContext';

export default function GameStartScreen() {
  const game = useGame();
  const { startGame } = useActions();

  const { input } = game;

  useEffect(() => {
    if (input.actionKeyDown) {
      startGame();
    }
  }, [input.actionKeyDown, startGame]);

  return <div className="GameStartScreen">
    press
    <div className="GameStartScreen-space">SPACE</div>
    to start</div>;
}
