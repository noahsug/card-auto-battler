import { styled } from 'styled-components';

import { MAX_WINS } from '../../../game/constants';
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
  lives,
}: {
  wonLastBattle: boolean;
  wins: number;
  lives: number;
}) {
  if (lives <= 0) return 'Game Over';
  if (wins >= MAX_WINS) return `You win!`;
  return wonLastBattle ? 'Victory!' : 'Defeat';
}

function getButtonText({ wins, lives }: { wins: number; lives: number }) {
  if (isGameOver({ wins, lives })) return 'New Game';
  return 'Continue';
}

export function BattleResultOverlay({ game, onContinue, wonLastBattle }: Props) {
  const { wins, lives } = game;
  const message = getBattleResultMessage({ wonLastBattle, wins, lives });
  const buttonText = getButtonText({ wins, lives });

  return (
    <Container>
      <Header>{message}</Header>
      <ContinueButton onClick={onContinue}>{buttonText}</ContinueButton>
    </Container>
  );
}
