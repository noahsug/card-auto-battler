import { styled } from 'styled-components';

import Button from './shared/Button';
import Container from './shared/Container';

interface Props {
  onNewGame: () => void;
}

export default function StartScreen({ onNewGame }: Props) {
  return (
    <Container>
      <Header>Chalkboard Heroes</Header>
      <StartButton onClick={onNewGame}>start</StartButton>
    </Container>
  );
}

const Header = styled('h1')`
  text-align: center;
  font-size: 4rem;
  margin-bottom: 2rem;
  margin-top: auto;
  text-transform: uppercase;
`;

const StartButton = styled(Button)`
  margin: auto;
`;
