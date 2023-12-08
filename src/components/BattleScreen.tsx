import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { useGameState, useActions } from './GameStateContext';
import Player from './Player';
import ProgressDisplay from './ProgressDisplay';
import { Screen } from './shared';

export default function BattleScreen() {
  // TODO: played card local state, process event, etc
  const game = useGameState();
  const { user, opponent, events } = game;
  const { startTurn, endTurn, endRound } = useActions();
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

      // TODO: rename round -> battle
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
        startTurn();
      } else if (currentTimeSinceLastAction >= 1000) {
        endTurn();
        timeSinceLastAction.current = 0;
      }
    }
    handle = requestAnimationFrame(tick);

    return () => {
      if (handle) cancelAnimationFrame(handle);
    };
  }, [startTurn, endTurn, user.health, opponent.health, endRound, isWaitingToStart]);

  return (
    <Screen>
      <ProgressDisplay />
      <Player isOpponent={true} forceInactive={isWaitingToStart} />
      <Divider />
      <Player isOpponent={false} forceInactive={isWaitingToStart} />
    </Screen>
  );
}

const Divider = styled.div`
  padding: 20rem;
`;
