import { useEffect, useRef, useState } from 'react';

import './BattleScreen.css';

import { useGame, useActions } from './GameContext';
import Player from './Player';
import ProgressDisplay from './ProgressDisplay';

export default function BattleScreen() {
  const game = useGame();
  const { user, opponent } = game;
  const { playCard, nextTurn, endRound } = useActions();
  const [isWaitingToStart, setIsWaitingToStart] = useState(true);

  const timeSinceLastAction = useRef(0);
  const elapsedTime = useRef<number | undefined>(undefined);

  useEffect(() => {
    let handle: ReturnType<typeof requestAnimationFrame> | undefined;

    function tick(timestamp: number) {
      handle = requestAnimationFrame(tick);

      if (elapsedTime.current === undefined) {
        elapsedTime.current = timestamp;
        return;
      }

      const currentTimeSinceLastAction = timeSinceLastAction.current;

      timeSinceLastAction.current += timestamp - elapsedTime.current;
      elapsedTime.current = timestamp;

      // return; // DEBUG

      const isRoundOver = user.health <= 0 || opponent.health <= 0;

      if (isRoundOver) {
        if (currentTimeSinceLastAction >= 1000) {
          endRound();
          timeSinceLastAction.current = 0;
        }
      } else if (isWaitingToStart) {
        if (currentTimeSinceLastAction >= 1000) {
          setIsWaitingToStart(false);
          timeSinceLastAction.current = 0;
        }
      } else if (currentTimeSinceLastAction === 0) {
        playCard();
      } else if (currentTimeSinceLastAction >= 1000) {
        nextTurn();
        timeSinceLastAction.current = 0;
      }
    }
    handle = requestAnimationFrame(tick);

    return () => {
      if (handle) cancelAnimationFrame(handle);
    };
  }, [playCard, nextTurn, user.health, opponent.health, endRound, isWaitingToStart]);

  return (
    <div className="BattleScreen">
      <ProgressDisplay />
      <Player isOpponent={true} forceInactive={isWaitingToStart} />
      <div className="BattleScreen-divider" />
      <Player isOpponent={false} forceInactive={isWaitingToStart} />
    </div>
  );
}
