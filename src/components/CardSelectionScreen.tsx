import { useState, useMemo } from 'react';
import styled from 'styled-components';

import { getCardSelectionsForBattle } from '../gameState';
import { useActions } from './GameStateContext';
import ProgressDisplay from './ProgressDisplay';
import { Screen, Title } from './shared';
import Card from './Card';
import { wait } from '../utils';
import { useSequence } from '../hooks';

import type { Sequence } from '../hooks';
import { CARD_SELECTION_PICKS } from '../gameState/constants';
import DeckOverlay from './DeckOverlay';
import { TopRightButton } from './shared/shared';

export default function CardSelectionScreen() {
  const { addCard, startBattle } = useActions();
  const [selectedCardIndexes, setSelectedCardIndexes] = useState(new Set<number>());
  const [deckOverlayActive, setDeckOverlayActive] = useState(false);

  const cards = getCardSelectionsForBattle();
  const canAddCards = selectedCardIndexes.size < CARD_SELECTION_PICKS;

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
      <TopRightButton onClick={() => setDeckOverlayActive(true)}>deck</TopRightButton>
      <ProgressDisplay />
      <Title>Select a Card</Title>
      <CardGrid>{cardComponents}</CardGrid>
      {deckOverlayActive && <DeckOverlay onClose={() => setDeckOverlayActive(false)} />}
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
