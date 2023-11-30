import styled from 'styled-components';

import { MAX_WINS, MAX_LOSSES } from '../gameState';
import { useGame } from './GameContext';

export default function ProgressDisplay() {
  const game = useGame();
  const { wins, losses } = game;

  const winsMessage = `🏆 Wins: ${wins}/${MAX_WINS}`;
  const lossesMessage = `☠️ Losses: ${losses}/${MAX_LOSSES}`;

  return (
    <Container>
      <ProgressMessage>{winsMessage}</ProgressMessage>
      <ProgressMessage>{lossesMessage}</ProgressMessage>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  margin: 10rem 0 30rem;
`;

const ProgressMessage = styled.div`
  & + & {
    margin-left: 20rem;
  }
`;
