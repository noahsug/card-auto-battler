import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getCardSelections } from '../state/game';
import { useActions } from './GameContext';
import ProgressDisplay from './ProgressDisplay';
import Title from './Title';
import Card from './Card';
import wait from '../utils/wait';

export default function CardSelectionScreen() {
  const { addCard, startRound } = useActions();
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

  const cards = getCardSelections();

  useEffect(() => {
    let cleanup: Awaited<ReturnType<typeof wait>> | undefined;
    (async () => {
      if (selectedCardIndex === null) return;
      cleanup = await wait(500);
      addCard(cards[selectedCardIndex]);
      startRound();
    })();

    return cleanup;
  }, [selectedCardIndex, startRound, addCard, cards]);

  const cardComponents = cards.map((card, i) => {
    return (
      <StyledCard
        key={i}
        card={card}
        scale={0.75}
        onClick={() => setSelectedCardIndex(i)}
        isActive={i === selectedCardIndex}
      />
    );
  });

  return (
    <div className="CardSelectionScreen">
      <ProgressDisplay />
      <Title>Select a Card</Title>
      <CardGrid>{cardComponents}</CardGrid>
    </div>
  );
}

const StyledCard = styled(Card)`
  margin: 10rem;
`;

const CardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;
