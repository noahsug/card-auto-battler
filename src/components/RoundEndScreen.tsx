import { useGameState, useActions } from './GameStateContext';
import ProgressDisplay from './ProgressDisplay';
import { Screen, Title, Subtitle } from './shared';

export default function RoundEndScreen() {
  const game = useGameState();
  const { startCardSelection } = useActions();

  const { user } = game;

  const isWin = user.health > 0;
  const title = isWin ? 'Victory' : 'Defeat';

  return (
    <Screen onClick={startCardSelection}>
      <Title>{title}</Title>
      <ProgressDisplay />
      <Subtitle>Next Fight?</Subtitle>
    </Screen>
  );
}
