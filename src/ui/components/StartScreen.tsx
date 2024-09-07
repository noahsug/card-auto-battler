import { styled } from 'styled-components';

import Button from './shared/Button';
import Container from './shared/Container';

interface Props {
  onNewGame: () => void;
}

export default function StartScreen({ onNewGame }: Props) {
  return (
    <Container>
      <Header>Card Auto Battler</Header>
      <StartButton onClick={onNewGame}>Start</StartButton>
    </Container>
  );
}

const Header = styled('h1')`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 5rem;
  margin-top: auto;
`;

const StartButton = styled(Button)`
  margin: auto;
`;
