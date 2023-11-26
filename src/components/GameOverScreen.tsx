import { useEffect } from 'react';

import './GameOverScreen.css';

import { useGame, useActions } from './GameContext';

export default function GameOverScreen() {
  const game = useGame();
  const { resetGame, actionKeyUsed } = useActions();

  useEffect(() => {
    if (game.input.actionKeyDown) {
      resetGame();
      actionKeyUsed();
    }
  }, [game.input.actionKeyDown, resetGame, actionKeyUsed]);

  const isWin = game.user.health > 0;
  const message = isWin ? 'You win!' : 'You lose!';

  return <div className="GameOverScreen">{message}</div>;
}
