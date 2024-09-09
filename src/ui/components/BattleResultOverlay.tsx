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
      <Header>{won ? 'Victory!' : 'defeat'}</Header>
      <NewGameButton onClick={onNewGame}>New Game</NewGameButton>
    </Container>
  );
}

const Header = styled('h2')`
  text-align: center;
  font-size: 10rem;
  margin-bottom: 2rem;
  margin-top: auto;
`;

const NewGameButton = styled(Button)`
  margin: auto;
`;
