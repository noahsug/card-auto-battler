import { styled } from 'styled-components';
import { useSpring, animated, useChain, config, useSpringRef } from '@react-spring/web';

import livesImage from '../../images/hourglass.png';
import battleImage from '../../images/swords.png';
import skullImage from '../../images/skull.png';
import brokenSkullImage from './broken-skull.png';
import rewindImage from './backward-time.png';

import { MAX_LOSSES, MAX_WINS } from '../../../game/constants';
import { GameState } from '../../../game/gameState';
import { Button } from '../shared/Button';
import { Container } from '../shared/Container';
import { useUnits } from '../../hooks/useUnits';
import { maskImage } from '../../style';
import { Row } from '../shared/Row';
import { plural } from '../../../utils/plural';
import { useState } from 'react';
import { getIsBossBattle, getIsGameOver } from '../../../game/utils/selectors';

const Header = styled(animated.h2)`
  text-align: center;
  font-size: max(8rem, 30vmin);
  margin-bottom: max(2rem, 10vmin);
  margin-top: auto;
`;

const ContinueButton = styled(Button)`
  margin: auto;
`;

// TODO: Share code with HUD, make scaling units generalizable and easy to use
const size = 'max(2.5rem, 8vmin)';
const padding = 'max(0.6rem, 2vmin)';

const ProgressRow = styled(Row)`
  margin-top: 2rem;
`;

const Label = styled(animated(Row))`
  font-size: ${size};
  font-family: var(--font-heading);
  padding: ${padding};
  justify-content: center;
`;

const Icon = styled(animated.div)<{ src: string }>`
  width: ${size};
  height: ${size};
  margin-right: ${padding};
  ${maskImage}
  background-color: var(--color-primary);
  display: inline-block;
`;

const ButtonIcon = styled(Icon)`
  width: 1.7rem;
  height: 1.7rem;
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

  // used to animate the value changing from its previous value to its current value
  const [offset, setOffset] = useState(1);
  const displayedLosses = losses - (wonLastBattle ? 0 : offset);
  const displayedWins = wins - (wonLastBattle ? offset : 0);

  const livesLeft = MAX_LOSSES - displayedLosses;
  const battleNumber = displayedWins;

  const [showBrokenSkull, setShowBrokenSkull] = useState(false);
  const skullImageToDisplay = showBrokenSkull ? brokenSkullImage : skullImage;
  const winsImage = wins >= MAX_WINS ? skullImageToDisplay : battleImage;

  const colorToAnimateTo = wonLastBattle ? 'hsl(150, 50%, 50%)' : 'hsl(0, 50%, 50%)';

  const [message, continueText] = getBattleResultMessage({ wonLastBattle, wins, losses });

  const headerAnimation = useSpringRef();
  const headerStyle = useSpring({
    from: { y: u(50) },
    to: [{ y: 0, config: config.wobbly }],
    ref: headerAnimation,
  });

  const labelAnimation = useSpringRef();
  const labelStyle = useSpring({
    from: { color: '#fcfafb', scale: 1 },
    to: [
      { color: colorToAnimateTo, scale: 1.3 },
      ...(isGameOver ? [] : [{ color: '#fcfafb', scale: 1 }]),
    ],
    onStart: () => {
      setOffset(0);
    },
    onRest: () => {
      setShowBrokenSkull(true);
    },
    ref: labelAnimation,
  });

  const iconStyle = useSpring({
    from: { backgroundColor: '#fcfafb' },
    to: [
      { backgroundColor: colorToAnimateTo },
      ...(isGameOver ? [] : [{ backgroundColor: '#fcfafb' }]),
    ],
    ref: labelAnimation,
  });

  const [winsStyle, livesStyle] = wonLastBattle ? [labelStyle, {}] : [{}, labelStyle];
  const [winsIconStyle, livesIconStyle] = wonLastBattle ? [iconStyle, {}] : [{}, iconStyle];

  useChain([headerAnimation, labelAnimation]);

  return (
    <Container>
      <Header style={headerStyle}>{message}</Header>
      <ProgressRow>
        <Label style={winsStyle}>
          <Icon style={winsIconStyle} src={winsImage} />
          <span>{`wins ${battleNumber}/${MAX_WINS}`}</span>
        </Label>
        <Label style={livesStyle}>
          <Icon style={livesIconStyle} src={livesImage} />
          <span>
            {livesLeft} {plural(livesLeft, 'rewind')}
          </span>
        </Label>
      </ProgressRow>
      <ContinueButton onClick={onContinue}>
        {continueText === 'Rewind' ? <ButtonIcon src={rewindImage} /> : null}
        {continueText === 'Continue' && isBossBattle ? <ButtonIcon src={skullImage} /> : null}
        <span>{continueText}</span>
      </ContinueButton>
    </Container>
  );
}
