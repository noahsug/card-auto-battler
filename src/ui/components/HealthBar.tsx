import { styled } from 'styled-components';
import clamp from 'lodash/clamp';
import { useEffect, useState } from 'react';
import { animated, useSpring } from '@react-spring/web';

import healthBarBorderImage from '../images/health-bar-border.png';
import healthBarInnerImage from '../images/health-bar-inner.png';
import { CARD_ANIMATION_DELAY } from './CardStack/useCardStackAnimation';

interface Props {
  health: number;
  maxHealth: number;
}

export default function HealthBar({ health, maxHealth }: Props) {
  const [displayedHealth, setDisplayedHealth] = useState(health);
  const [displayedMaxHealth, setDisplayedMaxHealth] = useState(maxHealth);

  // delay changes in the health bar so they line up with the card animation
  useEffect(() => {
    setTimeout(() => {
      setDisplayedHealth(health);
      setDisplayedMaxHealth(maxHealth);
    }, CARD_ANIMATION_DELAY);
  }, [health, maxHealth]);

  const [animationProps] = useSpring(
    {
      from: { width: '100%' },
      to: { width: `${clamp((displayedHealth / displayedMaxHealth) * 100, 0, 100)}%` },
    },
    [displayedHealth, displayedMaxHealth],
  );

  return (
    <Root>
      <img src={healthBarBorderImage} alt="health-bar" />
      {/* <Bar style={{ width: `${width}%` }} /> */}
      <Bar style={animationProps} />
      <Label>
        {displayedHealth} / {displayedMaxHealth}
      </Label>
    </Root>
  );
}

const WIDTH = 10;

const Root = styled.div`
  position: relative;
  width: ${WIDTH}rem;
  height: ${WIDTH / 5.5}rem;
  font-size: 2rem;

  img {
    max-width: 100%;
    max-height: 100%;
  }
`;

const Bar = styled(animated.div)`
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-image: url(${healthBarInnerImage});
  background-position: left;
  background-size: cover;
`;

const Label = styled.h2`
  position: absolute;
  top: -0.3em;
  left: 0;
  width: 100%;
  text-align: center;
  font-weight: bold;
  text-shadow:
    0.03em 0.03em 0 black,
    0.03em -0.03em 0 black,
    -0.03em 0.03em 0 black,
    -0.03em -0.03em 0 black;
`;
