import styled from 'styled-components';

import { useGameState, useActions } from './GameStateContext';
import Player from './Player';
import ProgressDisplay from './ProgressDisplay';
import { Screen } from './shared';
import { getIsRoundOver } from '../gameState';
import { wait } from '../utils';
import useSequence from '../hooks/useSequence';
import { useCallback } from 'react';

export default function BattleScreen() {
  const game = useGameState();
  const { startTurn, playCard, processEvent, endTurn, endRound } = useActions();

  const isRoundOver = getIsRoundOver(game);

  useSequence([
    useCallback(() => {
      startTurn();
      playCard();
      processEvent();
      return wait(1000);
    }, [startTurn, playCard, processEvent]),
    useCallback(() => isRoundOver && endRound(), [isRoundOver, endRound]),
    useCallback(() => endTurn(), [endTurn]),
  ]);

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
