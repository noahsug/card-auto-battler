import styled from 'styled-components';

import { useGameState, useActions } from './GameStateContext';
import Player from './Player';
import ProgressDisplay from './ProgressDisplay';
import { Screen } from './shared';
import { CardState, getCanPlayCard, getCurrentCard, getIsBattleOver } from '../gameState';
import { wait } from '../utils';
import useSequence from '../hooks/useSequence';
import type { Sequence } from '../hooks/useSequence';
import { useMemo, useState } from 'react';
import { getIsOpponentTurn } from '../gameState/gameState';

export default function BattleScreen() {
  const game = useGameState();
  const { startTurn, playCard, endTurn, endBattle } = useActions();
  const [activePlayerCard, setActivePlayerCard] = useState<
    { card: CardState; isOpponentCard: boolean } | undefined
  >();

  const isBattleOver = getIsBattleOver(game);
  const canPlayCard = getCanPlayCard(game);
  const currentCard = getCurrentCard(game);
  const isOpponentTurn = getIsOpponentTurn(game);

  const battleSequence: Sequence = useMemo(() => {
    function startTurnSequence() {
      startTurn();
    }

    function playCardSequence() {
      setActivePlayerCard({ card: currentCard, isOpponentCard: isOpponentTurn });
      playCard();
      return wait(1000);
    }

    return [
      () => wait(500),
      startTurnSequence,
      playCardSequence,
      (goTo) => {
        if (isBattleOver) {
          endBattle();
          return wait(500);
        } else if (canPlayCard) {
          goTo(playCardSequence);
        } else {
          endTurn();
          goTo(startTurnSequence);
        }
      },
    ];
  }, [
    startTurn,
    currentCard,
    isOpponentTurn,
    playCard,
    isBattleOver,
    canPlayCard,
    endBattle,
    endTurn,
  ]);

  useSequence(battleSequence);

  const [activeUserCard, activeOpponentCard] = activePlayerCard?.isOpponentCard
    ? [undefined, activePlayerCard.card]
    : [activePlayerCard?.card, undefined];

  return (
    <Screen>
      <ProgressDisplay />
      <Player isOpponent={true} activeCard={activeOpponentCard} />
      <Divider />
      <Player isOpponent={false} activeCard={activeUserCard} />
    </Screen>
  );
}

const Divider = styled.div`
  padding: 20rem;
`;
