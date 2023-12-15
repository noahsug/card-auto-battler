import { useEffect } from 'react';
import styled from 'styled-components';

import { useGameState, useActions } from './GameStateContext';
import Player from './Player';
import ProgressDisplay from './ProgressDisplay';
import { Screen } from './shared';
import { wait } from '../utils';
import { getActivePlayer, getIsRoundOver } from '../gameState';

export default function BattleScreen() {
  // const [cardsPlayed, setCardsPlayed] = useState(0);
  // const [activeCard, setActiveCard] = useState(null);

  const game = useGameState();
  const { startTurn, playCard, processEvent, endTurn, endRound } = useActions();
  // const battleSequence = useBattleSequence({ cardsPlayed, activeCard, isPaused });

  const { turn, events } = game;
  const activePlayer = getActivePlayer(game);
  const isRoundOver = getIsRoundOver(game);

  // start the turn when the previous turn ends
  useEffect(() => {
    console.log('start turn', turn);
    startTurn();
  }, [turn]);

  // play card
  useEffect(() => {
    if (activePlayer.actions > 0 && events.length === 0) {
      (async () => {
        await wait(1000);
        console.log('play card');
        playCard();
      })();
    }
  }, [activePlayer.actions, events.length]);

  // process the next event
  const hasEvents = events.length > 0;
  useEffect(() => {
    if (!hasEvents) return;
    (async () => {
      for await (const _ of events) {
        console.log('process event');
        processEvent();
        await wait(1000);
      }
      if (activePlayer.actions === 0) {
        console.log('end turn');
        endTurn();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasEvents]);

  // end the battle when a player has died
  useEffect(() => {
    if (isRoundOver) {
      (async () => {
        await wait(1000);
        console.log('end round');
        endRound();
      })();
    }
  }, [isRoundOver]);

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
      <Player isOpponent={true} />
      <Divider />
      <Player isOpponent={false} />
    </Screen>
  );
}

const Divider = styled.div`
  padding: 20rem;
`;
