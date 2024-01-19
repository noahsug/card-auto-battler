import styled from 'styled-components';

import { useGameState, useActions } from './GameStateContext';
import Player from './Player';
import ProgressDisplay from './ProgressDisplay';
import { Screen } from './shared';
import {
  CardState,
  getCanPlayCard,
  getCurrentCard,
  getIsBattleOver,
  getIsEnemyTurn,
} from '../gameState';
import { wait } from '../utils';
import { useSequence } from '../hooks';
import { useMemo, useState } from 'react';

import type { Sequence } from '../hooks';

export default function BattleScreen() {
  const game = useGameState();
  const { startTurn, playCard, endTurn, endBattle } = useActions();
  const [activePlayerCard, setActivePlayerCard] = useState<
    { card: CardState; isEnemyCard: boolean } | undefined
  >();

  const isBattleOver = getIsBattleOver(game);
  const canPlayCard = getCanPlayCard(game);
  const currentCard = getCurrentCard(game);
  const isEnemyTurn = getIsEnemyTurn(game);
  const { enemy, user } = game;

  const battleSequence: Sequence = useMemo(() => {
    function startTurnSequence() {
      startTurn();
    }

    function playCardSequence() {
      setActivePlayerCard({ card: currentCard, isEnemyCard: isEnemyTurn });
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
    isEnemyTurn,
    playCard,
    isBattleOver,
    canPlayCard,
    endBattle,
    endTurn,
  ]);

  useSequence(battleSequence);

  const [activeUserCard, activeEnemyCard] = activePlayerCard?.isEnemyCard
    ? [undefined, activePlayerCard.card]
    : [activePlayerCard?.card, undefined];

  return (
    <Screen>
      <ProgressDisplay />
      <Player player={enemy} activeCard={activeEnemyCard} />
      <Divider />
      <Player player={user} activeCard={activeUserCard} />
    </Screen>
  );
}

const Divider = styled.div``;
