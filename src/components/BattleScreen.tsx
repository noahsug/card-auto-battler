import styled from 'styled-components';

import { useGameState, useActions } from './GameStateContext';
import Player from './Player';
import ProgressDisplay from './ProgressDisplay';
import { Screen } from './shared';
import { getIsRoundOver } from '../gameState';
import { wait } from '../utils';
import useSequence from '../hooks/useSequence';

export default function BattleScreen() {
  const game = useGameState();
  const { startTurn, playCard, processEvent, endTurn, endRound } = useActions();

  const isRoundOver = getIsRoundOver(game);

  useSequence([
    () => wait(500),
    () => {
      startTurn();
      playCard();
      processEvent();
      return wait(500);
    },
    () => {
      if (!isRoundOver) return;
      endRound();
      return wait(500);
    },
    () => endTurn(),
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
