import { useEffect, useState, useRef } from 'react';

import './BattleScreen.css';

import { useGame, useActions } from './GameContext';
import Player from './Player';

export default function BattleScreen() {
  const [isWaitingToStart, setIsPaused] = useState(true);
  const game = useGame();
  const { turn, input } = game;
  const { playCard, actionKeyUsed, goToScreen } = useActions();

  const elapsedTime = useRef(0);
  const previousTime = useRef(0);

  useEffect(() => {
    if (input.actionKeyDown) {
      setIsPaused(false);
      actionKeyUsed();
    }
  }, [input.actionKeyDown, actionKeyUsed]);

  useEffect(() => {
    if (isWaitingToStart) return;
    let handle: ReturnType<typeof requestAnimationFrame> | undefined;

    function tick(dt: number) {
      elapsedTime.current += dt - previousTime.current;
      previousTime.current = dt;

      if (elapsedTime.current >= 1000) {
        elapsedTime.current = 0;
        playCard();
      }

      handle = requestAnimationFrame(tick);
    }
    handle = requestAnimationFrame(tick);

    return () => {
      if (handle) cancelAnimationFrame(handle);
    };
  }, [playCard, isWaitingToStart]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (game.user.health <= 0 || game.opponent.health <= 0) {
      timeout = setTimeout(() => {
        goToScreen('gameOver');
      }, 1000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [game.user.health, game.opponent.health, goToScreen]);

  return (
    <div className="BattleScreen">
      Turn: {turn}
      <Player isOpponent={true} />
      <div className="BattleScreen-divider" />
      <Player isOpponent={false} />
    </div>
  );
}
