import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getCardSelectionsForRound, getRound } from '../state';
import { useGame, useActions } from './GameContext';
import ProgressDisplay from './ProgressDisplay';
import { Screen, Title } from './shared';
import Card from './Card';
import { wait } from '../utils';

export default function CardSelectionScreen() {
  const game = useGame();
  const { addCard, startRound } = useActions();
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

  const cards = getCardSelectionsForRound(getRound(game));

  useEffect(() => {
    let cleanup: Awaited<ReturnType<typeof wait>> | undefined;
    (async () => {
      if (selectedCardIndex === null) return;
      cleanup = await wait(200);
      addCard(cards[selectedCardIndex]);
      startRound();
    })();

    return cleanup;
  }, [selectedCardIndex, startRound, addCard, cards]);

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
