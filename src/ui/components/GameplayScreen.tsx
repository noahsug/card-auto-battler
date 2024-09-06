import { useActions, useGameState, useUndo } from './GameStateContext';
import Button from './Button';
import { useEffect } from 'react';

interface Props {
  onWin: () => void;
  onLose: () => void;
}

export default function GameplayScreen({ onWin: handleWin, onLose: handleLose }: Props) {
  const { counter } = useGameState();
  const { increment, reset } = useActions();
  const { canUndo, undo } = useUndo();

  async function handleIncrement() {
    increment();
  }

  useEffect(() => {
    if (counter === 5) {
      handleWin();
      reset();
    }
  }, [counter]);

  return (
    <div>
      <div>GAMEPLAY {counter}</div>
      <Button onClick={handleIncrement}>plus</Button>
      {canUndo && <Button onClick={undo}>undo</Button>}
      <Button onClick={handleLose}>give up</Button>
    </div>
  );
}
