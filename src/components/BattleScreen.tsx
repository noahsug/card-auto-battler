import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { useGameState, useActions } from './GameStateContext';
import Player from './Player';
import ProgressDisplay from './ProgressDisplay';
import { Screen } from './shared';
import { wait } from '../utils';
import { getActivePlayer, isRoundOver } from '../gameState';

export default function BattleScreen() {
  const [battleStarted, setBattleStarted] = useState(false);
  // TODO: played card local state, process event, etc
  const game = useGameState();
  const { startTurn, playCard, processEvent, endTurn, endRound } = useActions();

  const { user, opponent, turn, events } = game;
  const activePlayer = getActivePlayer(game);
  const isRoundOver = isRoundOver(game);

  useEffect(() => {
    if (battleStarted) return;
    (async () => {
      await wait(1000);
      setBattleStarted(true);
    })();
  });

  useEffect(() => {
    startTurn();
  }, [startTurn, turn]);

  useEffect(() => {
    if (events.length === 0) return;
    (async () => {
      processEvent();
      await wait(1000);
      if (events.length === 0) {
        if (activePlayer.actions > 0) {
        }
      }
    })();
  }, [processEvent, events]);

  useEffect(() => {
    if (user.health <= 0 || opponent.health <= 0) {
      (async () => {
        await wait(1000);
        endRound();
      })();
    }
  }, [endRound, opponent.health, user.health]);

  //     // TODO: rename round -> battle
  //     const isRoundOver = user.health <= 0 || opponent.health <= 0;

  //     if (isRoundOver) {
  //       if (currentTimeSinceLastAction >= 1000) {
  //         endRound();
  //         timeSinceLastAction.current = 0;
  //       }
  //     } else if (isWaitingToStart) {
  //       if (currentTimeSinceLastAction >= 1000) {
  //         setIsWaitingToStart(false);
  //         timeSinceLastAction.current = 0;
  //       }
  //     } else if (currentTimeSinceLastAction === 0) {
  //       startTurn();
  //     } else if (currentTimeSinceLastAction >= 1000) {
  //       endTurn();
  //       timeSinceLastAction.current = 0;
  //     }
  //   }
  // }, [startTurn, endTurn, user.health, opponent.health, endRound, isWaitingToStart]);

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
