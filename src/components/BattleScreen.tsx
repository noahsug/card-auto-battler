import { useEffect, useRef, useState } from 'react';

import './BattleScreen.css';

import { useGame, useActions } from './GameContext';
import { MAX_WINS, MAX_LOSSES } from '../state/game';
import Player from './Player';

export default function BattleScreen() {
  const game = useGame();
  const { wins, losses, user, opponent } = game;
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

      const isGameOver = user.health <= 0 || opponent.health <= 0;

      if (isGameOver) {
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

  const lives = new Array(MAX_LOSSES - losses).fill('❤️').join('');

  return (
    <div className="BattleScreen">
      <div>
        Wins: {wins}/{MAX_WINS} Lives: {lives}
      </div>
      <Player isOpponent={true} forceInactive={isWaitingToStart} />
      <div className="BattleScreen-divider" />
      <Player isOpponent={false} forceInactive={isWaitingToStart} />
    </div>
  );
}
