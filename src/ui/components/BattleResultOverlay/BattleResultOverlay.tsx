import { animated, config, useSpring } from '@react-spring/web';
import { styled } from 'styled-components';

import livesImage from '../HUD/hourglass.png';
import skullImage from '../HUD/skull.png';
import battleImage from '../HUD/swords.png';
import rewindImage from './backward-time.png';
import brokenSkullImage from './broken-skull.png';
import brokenLivesImage from './broken-hourglass.png';

import { useState } from 'react';
import { MAX_LOSSES, MAX_WINS } from '../../../game/constants';
import { GameState } from '../../../game/gameState';
import { getIsBossBattle, getIsGameOver } from '../../../game/utils/selectors';
import { plural } from '../../../utils/plural';
import { useUnits } from '../../hooks/useUnits';
import { Icon, Label } from '../HUD/HUD';
import { Button } from '../shared/Button';
import { Container } from '../shared/Container';
import { Row } from '../shared/Row';

const Header = styled(animated.h2)`
  text-align: center;
  font-size: max(8rem, 30vmin);
  margin-bottom: max(2rem, 10vmin);
  margin-top: auto;
`;

const ContinueButton = styled(Button)`
  margin: auto;
  width: auto;
  padding: 0.5rem 1rem;
`;

const ProgressRow = styled(Row)`
  margin-top: 2rem;
`;

const size = 'max(2.5rem, 8vmin)';
const padding = 'max(0.6rem, 2vmin)';

const ResultsLabel = styled(animated(Label))`
  font-size: ${size};
  padding: ${padding};
`;

const ResultsIcon = styled(animated(Icon))`
  width: ${size};
  height: ${size};
  margin-right: ${padding};
  display: inline-block;
`;

const ButtonIcon = styled(ResultsIcon)`
  width: 1.7rem;
  height: 1.7rem;
  margin-right: 0.5rem;
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
  if (losses >= MAX_LOSSES) return ['Game Over', 'Main Menu'];
  if (wins >= MAX_WINS) return [`You Win!`, 'Main Menu'];
  return wonLastBattle ? ['Victory!', 'Continue'] : ['Defeat', 'Rewind'];
}

export function BattleResultOverlay({ game, onContinue, wonLastBattle }: Props) {
  const [u] = useUnits();
  const { wins, losses } = game;
  const isGameOver = getIsGameOver(game);
  const isBossBattle = getIsBossBattle(game);

  const colorToAnimateTo = wonLastBattle ? 'hsl(150, 50%, 50%)' : 'hsl(0, 50%, 50%)';
  const [message, continueText] = getBattleResultMessage({ wonLastBattle, wins, losses });
  const animationDelay = 500;

  // used to animate the value changing from its previous value to its current value
  const [offset, setOffset] = useState(1);
  const displayedLivesLeft = MAX_LOSSES - losses + (wonLastBattle ? 0 : offset);
  const displayedWins = wins - (wonLastBattle ? offset : 0);

  const [showBrokenIcon, setShowBrokenIcon] = useState(false);
  const skullImageToDisplay = showBrokenIcon ? brokenSkullImage : skullImage;
  const winsImage = wins >= MAX_WINS ? skullImageToDisplay : battleImage;
  const livesImageToDisplay =
    showBrokenIcon && losses >= MAX_LOSSES ? brokenLivesImage : livesImage;

  const [headerStyle] = useSpring(() => ({
    from: { y: u(50) },
    to: { y: 0, config: config.wobbly },
  }));

  const progressValueStartingState = { color: 'var(--color-primary)', scale: 1 };
  const [labelStyle] = useSpring(() => ({
    from: progressValueStartingState,
    to: [
      { color: colorToAnimateTo, scale: 1.3 },
      ...(isGameOver ? [] : [progressValueStartingState]),
    ],
    delay: animationDelay,
    onStart: () => {
      setOffset(0);
    },
    onRest: () => {
      if (isGameOver) {
        setShowBrokenIcon(true);
      }
    },
  }));

  const iconStartingState = { backgroundColor: 'var(--color-primary)' };
  const [iconStyle] = useSpring(() => ({
    from: iconStartingState,
    to: [{ backgroundColor: colorToAnimateTo }, ...(isGameOver ? [] : [iconStartingState])],
    delay: animationDelay,
  }));

  // animate either the number of wins or the number of lives left, depending on if the user won or lost
  const [winsStyle, livesStyle] = wonLastBattle ? [labelStyle, {}] : [{}, labelStyle];
  const [winsIconStyle, livesIconStyle] = wonLastBattle ? [iconStyle, {}] : [{}, iconStyle];

  return (
    <Container>
      <Header style={headerStyle}>{message}</Header>
      <ProgressRow>
        <ResultsLabel style={winsStyle}>
          <ResultsIcon style={winsIconStyle} src={winsImage} />
          <span>{`wins ${displayedWins}/${MAX_WINS}`}</span>
        </ResultsLabel>
        <ResultsLabel style={livesStyle}>
          <ResultsIcon style={livesIconStyle} src={livesImageToDisplay} />
          <span>
            {displayedLivesLeft} {plural(displayedLivesLeft, 'rewind')}
          </span>
        </ResultsLabel>
      </ProgressRow>
      <ContinueButton onClick={onContinue}>
        {continueText === 'Rewind' ? <ButtonIcon src={rewindImage} /> : null}
        {continueText === 'Continue' && isBossBattle ? <ButtonIcon src={skullImage} /> : null}
        <span>{continueText}</span>
      </ContinueButton>
    </Container>
  );
}
