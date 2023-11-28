import { Screen, Title, Subtitle } from './shared';
import { MAX_WINS } from '../state';
import { useGame, useActions } from './GameContext';
import ProgressDisplay from './ProgressDisplay';

export default function GameEndScreen() {
  const game = useGame();
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
