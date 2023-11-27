import styled from 'styled-components';

import { MAX_WINS, MAX_LOSSES } from '../state/game';
import { useGame } from './GameContext';
import rel from './shared/rel';

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
  margin: ${rel(10)} 0 ${rel(30)};
`;

const ProgressMessage = styled.div`
  & + & {
    margin-left: ${rel(20)};
  }
`;
