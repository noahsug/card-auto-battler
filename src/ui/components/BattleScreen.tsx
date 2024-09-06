import { useEffect } from 'react';
import { styled } from 'styled-components';

import { useActions, useGameState, useUndo } from './GameStateContext';
import Button from './shared/Button';
import Container from './shared/Container';

interface Props {
  onBattleOver: () => void;
}

export default function BattleScreen({ onBattleOver }: Props) {
  const { counter, won } = useGameState();
  const { increment } = useActions();
  const { canUndo, undo } = useUndo();

  async function handleIncrement() {
    increment();
  }

  useEffect(() => {
    if (won) {
      onBattleOver();
    }
  }, [onBattleOver, won]);

  return (
    <Container>
      <LargeText>{counter}</LargeText>
      <Button onClick={handleIncrement}>plus</Button>
      {canUndo && <Button onClick={undo}>undo</Button>}
      <ButtonButton onClick={onBattleOver}>give up</ButtonButton>
    </Container>
  );
}

const LargeText = styled.div`
  font-size: 4rem;
  margin: 4rem auto 3rem;
`;

const ButtonButton = styled(Button)`
  margin-top: auto;
  margin-bottom: 2rem;
`;
