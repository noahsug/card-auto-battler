import styled from 'styled-components';

import { useGameState, useActions } from './GameStateContext';
import Player from './Player';
import ProgressDisplay from './ProgressDisplay';
import { Screen } from './shared';
import { getCanPlayCard, getIsRoundOver } from '../gameState';
import { wait } from '../utils';
import useSequence from '../hooks/useSequence';
import type { Sequence } from '../hooks/useSequence';
import { useMemo } from 'react';

export default function BattleScreen() {
  const game = useGameState();
  const { startTurn, playCard, endTurn, endRound } = useActions();

  const isRoundOver = getIsRoundOver(game);
  const canPlayCard = getCanPlayCard(game);

  const sequence: Sequence = useMemo(() => {
    function startTurnSequence() {
      startTurn();
    }

    function playCardSequence() {
      playCard();
      return wait(500);
    }

    return [
      () => wait(500),
      startTurnSequence,
      playCardSequence,
      (run) => {
        if (isRoundOver) {
          endRound();
          return wait(500);
        } else if (canPlayCard) {
          run(playCardSequence);
        } else {
          endTurn();
          run(startTurnSequence);
        }
      },
    ];
  }, [isRoundOver, canPlayCard, endRound, endTurn, startTurn, playCard]);

  useSequence(sequence);

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
