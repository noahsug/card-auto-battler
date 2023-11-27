import { useEffect } from 'react';
import styled from 'styled-components';

import { getCardSelections } from '../state/game';
import { useGame, useActions } from './GameContext';
import ProgressDisplay from './ProgressDisplay';
import Title from './Title';
import rel from './shared/rel';
import Card from './Card';

export default function CardSelectionScreen() {
  const game = useGame();
  const { startRound } = useActions();

  const { input } = game;

  useEffect(() => {
    if (input.actionKeyDown) {
      startRound();
    }
  }, [input.actionKeyDown, startRound]);

  const cards = getCardSelections();
  const cardComponents = cards.map((card, i) => {
    return <StyledCard key={i} card={card} scale={0.75} />;
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
  margin: ${rel(10)};
`;

const CardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;
