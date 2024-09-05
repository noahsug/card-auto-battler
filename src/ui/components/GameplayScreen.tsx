import { useActions, useGameState } from './GameStateProvider';
import Button from './Button';
import { useEffect } from 'react';
import wait from '../../utils/wait';

interface Props {
  onWin: () => void;
  onLose: () => void;
}

export default function GameplayScreen({ onWin: handleWin, onLose: handleLose }: Props) {
  const { counter } = useGameState();
  const { increment, reset } = useActions();

  async function handleIncrement() {
    increment(100);
    await wait(10);
    for (let i = 0; i < 90; i++) {
      increment(-1);
      await wait(10);
    }
    increment(-10);
    increment(1);
  }

  function handleUndo() {
    // TODO
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
      <Button onClick={handleUndo}>undo</Button>
      <Button onClick={handleLose}>give up</Button>
    </div>
  );
}
