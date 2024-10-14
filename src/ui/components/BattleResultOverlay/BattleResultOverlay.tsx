import { styled } from 'styled-components';

import { MAX_LOSSES, MAX_WINS } from '../../../game/constants';
import { isGameOver } from '../../../game/utils';
import { Button } from '../shared/Button';
import { Container } from '../shared/Container';
import { GameState } from '../../../game/gameState';

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
  if (wins >= MAX_WINS) return `You win!`;
  return wonLastBattle ? 'Victory!' : 'Defeat';
}

function getButtonText({ wins, losses }: { wins: number; losses: number }) {
  if (isGameOver({ wins, losses })) return 'New Game';
  return 'Continue';
}

export function BattleResultOverlay({ game, onContinue, wonLastBattle }: Props) {
  const { wins, losses } = game;
  const message = getBattleResultMessage({ wonLastBattle, wins, losses });
  const buttonText = getButtonText({ wins, losses });

  return (
    <Container>
      <Header>{message}</Header>
      <ContinueButton onClick={onContinue}>{buttonText}</ContinueButton>
    </Container>
  );
}
