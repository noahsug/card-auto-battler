import { useGameState, useActions } from './GameStateContext';
import ProgressDisplay from './ProgressDisplay';
import { Screen, Title, Subtitle } from './shared';

export default function BattleEndScreen() {
  const game = useGameState();
  const { startCardSelection } = useActions();

  const title = game.wonLastBattle ? 'Victory' : 'Defeat';

  return (
    <Screen onClick={startCardSelection}>
      <Title>{title}</Title>
      <ProgressDisplay />
      <Subtitle>Next Fight?</Subtitle>
    </Screen>
  );
}
