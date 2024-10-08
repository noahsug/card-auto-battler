import styled from 'styled-components';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useGameState, useActions } from './GameStateContext';
import Player from './Player';
import CombatText, { Props as CombatTextProps } from './CombatText';
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

import type { Sequence } from '../hooks';

export default function BattleScreen() {
  const game = useGameState();
  const { startTurn, playCard, endTurn, endBattle } = useActions();
  const [activePlayerCard, setActivePlayerCard] = useState<
    { card: CardState; isEnemyCard: boolean } | undefined
  >();
  const [userCombatTexts, setUserCombatTexts] = useState<CombatTextProps[]>([]);
  const [enemyCombatTexts, setEnemyCombatTexts] = useState<CombatTextProps[]>([]);
  const animationEventsAddedThisTurn = useRef(0);

  const isBattleOver = getIsBattleOver(game);
  const canPlayCard = getCanPlayCard(game);
  const currentCard = getCurrentCard(game);
  const isEnemyTurn = getIsEnemyTurn(game);
  const { enemy, user } = game;

  const battleSequence: Sequence = useMemo(() => {
    function startTurnSequence() {
      if (isBattleOver) {
        return endBattleSequence();
      }
      startTurn();
      animationEventsAddedThisTurn.current = 0;
    }

    function endBattleSequence() {
      endBattle();
      return wait(750);
    }

    function playCardSequence() {
      setActivePlayerCard({ card: currentCard, isEnemyCard: isEnemyTurn });
      playCard();
      return wait(2500);
    }

    return [
      () => wait(750),
      startTurnSequence,
      playCardSequence,
      (goTo) => {
        if (isBattleOver) {
          return endBattleSequence();
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

  useEffect(() => {
    if (game.battleEvents.length > animationEventsAddedThisTurn.current) {
      const newAnimationEvents = game.battleEvents.slice(animationEventsAddedThisTurn.current);
      newAnimationEvents.forEach(({ value, target, type }) => {
        const targetIsEnemy =
          // enemy is doing self damage
          (isEnemyTurn && target === 'self') ||
          // user is doing damage to enemy
          (!isEnemyTurn && target === 'opponent');
        const setCombatTexts = targetIsEnemy ? setEnemyCombatTexts : setUserCombatTexts;
        setCombatTexts((current) => [...current, { value, type }]);

        animationEventsAddedThisTurn.current = game.battleEvents.length;
      });
    }
  }, [game.battleEvents, isEnemyTurn]);

  const [activeUserCard, activeEnemyCard] = activePlayerCard?.isEnemyCard
    ? [undefined, activePlayerCard.card]
    : [activePlayerCard?.card, undefined];

  return (
    <Screen>
      <ProgressDisplay />
      <Player player={enemy} activeCard={activeEnemyCard}>
        {enemyCombatTexts.map((props, i) => (
          <CombatText key={i} {...props} />
        ))}
      </Player>
      <Divider />
      <Player player={user} activeCard={activeUserCard}>
        {userCombatTexts.map((props, i) => (
          <CombatText key={i} {...props} />
        ))}
      </Player>
    </Screen>
  );
}

const Divider = styled.div``;
