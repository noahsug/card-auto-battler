import styled from 'styled-components';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useGameState, useActions } from './GameStateContext';
import Player from './Player';
import DamageNumber, { Props as DamageNumberProps } from './DamageNumber';
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
  const [userDamageNumbers, setUserDamageNumbers] = useState<DamageNumberProps[]>([]);
  const [enemyDamageNumbers, setEnemyDamageNumbers] = useState<DamageNumberProps[]>([]);
  const animationEventsAddedThisTurn = useRef(0);

  const isBattleOver = getIsBattleOver(game);
  const canPlayCard = getCanPlayCard(game);
  const currentCard = getCurrentCard(game);
  const isEnemyTurn = getIsEnemyTurn(game);
  const { enemy, user } = game;

  const battleSequence: Sequence = useMemo(() => {
    function startTurnSequence() {
      startTurn();
      animationEventsAddedThisTurn.current = 0;
    }

    function playCardSequence() {
      setActivePlayerCard({ card: currentCard, isEnemyCard: isEnemyTurn });
      playCard();
      return wait(1500);
    }

    return [
      () => wait(750),
      startTurnSequence,
      playCardSequence,
      (goTo) => {
        if (isBattleOver) {
          endBattle();
          return wait(750);
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
    if (game.animationEvents.length > animationEventsAddedThisTurn.current) {
      const newAnimationEvents = game.animationEvents.slice(animationEventsAddedThisTurn.current);
      newAnimationEvents.forEach(({ value, target, type }) => {
        const targetIsEnemy =
          // enemy is doing self damage
          (isEnemyTurn && target === 'self') ||
          // user is doing damage to enemy
          (!isEnemyTurn && target === 'opponent');
        const setDamageNumbers = targetIsEnemy ? setEnemyDamageNumbers : setUserDamageNumbers;
        setDamageNumbers((current) => [...current, { value, type }]);

        animationEventsAddedThisTurn.current = game.animationEvents.length;
      });
    }
  }, [game.animationEvents, isEnemyTurn]);

  const [activeUserCard, activeEnemyCard] = activePlayerCard?.isEnemyCard
    ? [undefined, activePlayerCard.card]
    : [activePlayerCard?.card, undefined];

  return (
    <Screen>
      <ProgressDisplay />
      <Player player={enemy} activeCard={activeEnemyCard}>
        {enemyDamageNumbers.map((props, i) => (
          <DamageNumber key={i} {...props} />
        ))}
      </Player>
      <Divider />
      <Player player={user} activeCard={activeUserCard}>
        {userDamageNumbers.map((props, i) => (
          <DamageNumber key={i} {...props} />
        ))}
      </Player>
    </Screen>
  );
}

const Divider = styled.div``;
