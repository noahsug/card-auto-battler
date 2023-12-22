import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getCardSelectionsForBattle, getBattle } from '../gameState';
import { useGameState, useActions } from './GameStateContext';
import ProgressDisplay from './ProgressDisplay';
import { Screen, Title } from './shared';
import Card from './Card';
import { wait } from '../utils';

export default function CardSelectionScreen() {
  const game = useGameState();
  const { addCard, startBattle } = useActions();
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

  const cards = getCardSelectionsForBattle(getBattle(game));

  useEffect(() => {
    (async () => {
      if (selectedCardIndex === null) return;
      await wait(200);
      addCard(cards[selectedCardIndex]);
      startBattle();
    })();
  }, [selectedCardIndex, startBattle, addCard, cards]);

  const cardComponents = cards.map((card, i) => {
    return (
      <Card
        key={i}
        card={card}
        scale={0.75}
        onClick={() => setSelectedCardIndex(i)}
        isActive={i === selectedCardIndex}
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
