import { useEffect, useRef } from 'react';

import './BattleScreen.css';

import { useGame, useActions } from './GameContext';
import Player from './Player';
import { isOpponentTurn } from '../state/game';

export default function BattleScreen() {
  const { turn } = useGame();
  const { nextTurn, playCard } = useActions();

  const elapsedTime = useRef(0);
  const previousTime = useRef(0);

  useEffect(() => {
    let handle: ReturnType<typeof requestAnimationFrame> | undefined;

    function tick(dt: number) {
      elapsedTime.current += dt - previousTime.current;
      previousTime.current = dt;

      if (elapsedTime.current >= 2000) {
        elapsedTime.current = 0;
        playCard();
      }

      handle = requestAnimationFrame(tick);
    }
    handle = requestAnimationFrame(tick);

    return () => {
      if (handle) cancelAnimationFrame(handle);
    };
  }, [playCard]);

  //
  // //  take turns every 2 seconds
  // useEffect(() => {
  //   let timeout: any = null;
  //   if (turn === 0) {
  //     //timeout = setTimeout(() => {
  //       console.log('render battle screen', turn);
  //       playCard();
  //     // }, 2000);
  //   }
  //
  //   return () => clearInterval(timeout);
  // }, [playCard, turn]);

  return (
    <div className="BattleScreen">
      Turn: {turn}
      <Player isOpponent={true} />
      <div className="BattleScreen-divider" />
      <Player isOpponent={false} />
    </div>
  );
}
