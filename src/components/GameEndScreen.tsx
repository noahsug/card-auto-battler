import { Screen, Title, Subtitle } from './shared';
import { MAX_WINS } from '../gameState';
import { useGameState, useActions } from './GameStateContext';
import ProgressDisplay from './ProgressDisplay';

export default function GameEndScreen() {
  const game = useGameState();
  const { startGame } = useActions();

  const { wins } = game;

  const isWin = wins >= MAX_WINS;
  const title = isWin ? 'You win!' : 'Game Over';
  const subtitle = isWin ? 'Play again?' : 'Try again?';

  return (
    <Screen onClick={startGame}>
      <Title>{title}</Title>
      <ProgressDisplay />
      <Subtitle>{subtitle}</Subtitle>
    </Screen>
  );
}
