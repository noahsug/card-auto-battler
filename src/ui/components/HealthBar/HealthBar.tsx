import { animated, useSpring } from '@react-spring/web';
import { styled } from 'styled-components';

import { Image } from '../shared/Image';
import healthBarBorderImage from './health-bar-border.png';
import healthBarInnerImage from './health-bar-inner.png';
import { maskImage } from '../../style';

const WIDTH = 10;

const Root = styled.div`
  position: relative;
  width: ${WIDTH}rem;
  height: ${WIDTH / 5.5}rem;
  font-size: 2rem;

  ${Image} {
    max-width: 100%;
    max-height: 100%;
  }
`;

const healthBarColor = '#bbb';

const Border = styled.div<{ src: string }>`
  width: 100%;
  height: 100%;
  background-color: ${healthBarColor};
  ${maskImage}
  mask-size: 100% 100%;
`;

const Bar = styled(animated.div)<{ src: string }>`
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: ${healthBarColor};
  ${maskImage}
  mask-size: cover;
`;

const size = 0.03;

const Label = styled.h2`
  position: absolute;
  top: -0.3em;
  left: 0;
  width: 100%;
  text-align: center;
  font-weight: bold;
  text-shadow:
    ${size}em ${size}em 0 black,
    ${size}em -${size}em 0 black,
    -${size}em ${size}em 0 black,
    -${size}em -${size}em 0 black;
`;

interface Props {
  health: number;
  maxHealth: number;
}

export function HealthBar({ health, maxHealth }: Props) {
  health = Math.max(0, health);

  const [animationProps] = useSpring(
    {
      from: { width: '100%' },
      // ensure percent health remaining stays within 0% - 100%
      to: { width: `${Math.min((health / maxHealth) * 100, 100)}%` },
    },
    [health, maxHealth],
  );

  return (
    <Root>
      <Border src={healthBarBorderImage} />
      <Bar src={healthBarInnerImage} style={animationProps} />
      <Label>
        {health} / {maxHealth}
      </Label>
    </Root>
  );
}
