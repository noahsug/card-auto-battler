import { Screen, Title, Subtitle } from './shared';
import { useGameState, useActions } from './GameStateContext';
import ProgressDisplay from './ProgressDisplay';

export default function GameEndScreen() {
  const game = useGameState();
  const { startGame } = useActions();

  const title = game.wonLastBattle ? 'You win!' : 'Game Over';
  const subtitle = game.wonLastBattle ? 'Play again?' : 'Try again?';

  return (
    <Screen onClick={startGame}>
      <Title>{title}</Title>
      <ProgressDisplay />
      <Subtitle>{subtitle}</Subtitle>
    </Screen>
  );
}
