import { useState, useMemo } from 'react';
import styled from 'styled-components';

import { getCardSelectionsForBattle, getBattleCount } from '../gameState';
import { useGameState, useActions } from './GameStateContext';
import ProgressDisplay from './ProgressDisplay';
import { Screen, Title } from './shared';
import Card from './Card';
import { wait } from '../utils';
import { useSequence } from '../hooks';

import type { Sequence } from '../hooks';

const CARDS_TO_SELECT = 2;

export default function CardSelectionScreen() {
  const game = useGameState();
  const { addCard, startBattle } = useActions();
  const [selectedCardIndexes, setSelectedCardIndexes] = useState(new Set<number>());

  const cards = getCardSelectionsForBattle(getBattleCount(game));
  const canAddCards = selectedCardIndexes.size < CARDS_TO_SELECT;

  const startBattleSequence: Sequence = useMemo(
    () => [
      () => wait(200),
      () => {
        selectedCardIndexes.forEach((index) => addCard(cards[index]));
        startBattle();
      },
    ],
    [addCard, cards, selectedCardIndexes, startBattle],
  );

  useSequence(canAddCards ? [] : startBattleSequence);

  function selectCard(index: number) {
    if (!canAddCards) return;

    setSelectedCardIndexes((prev) => {
      const result = new Set(prev);
      if (result.has(index)) {
        result.delete(index);
      } else {
        result.add(index);
      }
      return result;
    });
  }

  const cardComponents = cards.map((card, i) => {
    return (
      <Card
        key={i}
        card={card}
        scale={0.75}
        onClick={() => selectCard(i)}
        isActive={selectedCardIndexes.has(i)}
      />
    );
  });

  return (
    <Screen>
      <ProgressDisplay />
      <Title>Select a Card</Title>
      <CardGrid>{cardComponents}</CardGrid>
    </Screen>
  );
}

const CardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  > * {
    margin: 10rem;
  }
`;
