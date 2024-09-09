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
    <Container>
      <img src={healthBarBorderImage} />
      <Bar style={{ width: `${width}%` }} />
      <Label>
        {health} / {maxHealth}
      </Label>
    </Container>
  );
}

const Container = styled.div`
  position: relative;
`;

const Bar = styled.div`
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-image: url(${healthBarInnerImage});
`;

const Label = styled.h2`
  position: absolute;
  top: -28px;
  left: 0;
  width: 100%;
  font-size: 100px;
  text-align: center;
  font-weight: bold;
  text-shadow:
    5px 5px 0 black,
    5px -5px 0 black,
    -5px 5px 0 black,
    -5px -5px 0 black;
`;
