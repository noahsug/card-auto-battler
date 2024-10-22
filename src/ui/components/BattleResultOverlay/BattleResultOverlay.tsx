import { styled } from 'styled-components';

import { MAX_LOSSES, MAX_WINS } from '../../../game/constants';
import { GameState } from '../../../game/gameState';
import { Button } from '../shared/Button';
import { Container } from '../shared/Container';

const Header = styled('h2')`
  text-align: center;
  font-size: 8rem;
  margin-bottom: 2rem;
  margin-top: auto;
`;

const ContinueButton = styled(Button)`
  margin: auto;
`;

interface Props {
  game: GameState;
  onContinue: () => void;
  wonLastBattle: boolean;
}

function getBattleResultMessage({
  wonLastBattle,
  wins,
  losses,
}: {
  wonLastBattle: boolean;
  wins: number;
  losses: number;
}) {
  if (losses >= MAX_LOSSES) return 'Game Over';
  if (wins >= MAX_WINS) return `You Win!`;
  return wonLastBattle ? 'Victory!' : 'Defeat';
}

export function BattleResultOverlay({ game, onContinue, wonLastBattle }: Props) {
  const { wins, losses } = game;
  const message = getBattleResultMessage({ wonLastBattle, wins, losses });

  return (
    <Container>
      <Header>{message}</Header>
      <ContinueButton onClick={onContinue}>Continue</ContinueButton>
    </Container>
  );
}
