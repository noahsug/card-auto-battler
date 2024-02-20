import styled from 'styled-components';
import { useGameState } from './GameStateContext';
import Card from './Card';
import { Screen, Subtitle } from './shared';
import { TopRightButton } from './shared/shared';

interface DeckOverlayProps {
  onClose: () => void;
}

export default function DeckOverlay({ onClose }: DeckOverlayProps) {
  const { user } = useGameState();

  const cardComponents = user.cards.map((card, i) => {
    return <Card key={i} card={card} scale={0.6} />;
  });

  return (
    <Overlay>
      <TopRightButton onClick={onClose}>X</TopRightButton>
      <Subtitle>Deck</Subtitle>
      <CardGrid>{cardComponents}</CardGrid>
    </Overlay>
  );
}

const Overlay = styled(Screen)`
  background-color: #fff;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const CardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  > * {
    margin: 3rem;
  }
`;
