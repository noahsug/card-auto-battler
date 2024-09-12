import { styled } from 'styled-components';

import healthBarBorderImage from '../images/health-bar-border.png';
import healthBarInnerImage from '../images/health-bar-inner.png';

interface Props {
  health: number;
  maxHealth: number;
}

export default function HealthBar({ health, maxHealth }: Props) {
  const width = (health / maxHealth) * 100;
  return (
    <Root>
      <img src={healthBarBorderImage} alt="health-bar" />
      <Bar style={{ width: `${width}%` }} />
      <Label>
        {health} / {maxHealth}
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

const Bar = styled.div`
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-image: url(${healthBarInnerImage});
  background-position: center;
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
