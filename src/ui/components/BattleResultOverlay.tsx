import { styled } from 'styled-components';

import Button from './shared/Button';
import Container from './shared/Container';
import { useGameState } from './GameStateContext';

interface Props {
  onNewGame: () => void;
}

export default function BattleResultOverlay({ onNewGame }: Props) {
  const { won } = useGameState();
  return (
    <Container>
      <Header>{won ? 'Victory!' : 'Defeat'}</Header>
      <NewGameButton onClick={onNewGame}>New Game</NewGameButton>
    </Container>
  );
}

const Header = styled.div`
  color: white;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 4rem;
  margin-top: 4rem;
`;

const NewGameButton = styled(Button)`
  margin: auto;
`;
