import { styled } from 'styled-components';

import { getHandDrawnBorderRadius, maskImage } from '../../style';
import { Row } from '../shared/Row';
import livesImage from './heart.png';
import battleImage from './swords.png';

const Label = styled(Row)`
  font-size: 2rem;
  font-family: var(--font-heading);
  letter-spacing: var(--letter-spacing-heading);
  background-color: var(--color-bg-opaque);
  justify-content: center;
  padding: 0 0.5rem;

  ${getHandDrawnBorderRadius()}
  border: solid 0.75rem var(--color-bg-opaque);

  > div {
    line-height: 0.85;
    height: 1em;
  }
`;

const Icon = styled.div<{ src: string }>`
  height: 2rem;
  width: 2rem;
  margin-right: 1rem;
  ${maskImage}
  background-color: var(--color-primary);
`;

interface Props {
  lives: number;
  wins: number;
}

export function HUD({ lives, wins }: Props) {
  return (
    <Row>
      <Label>
        <Icon src={livesImage} />
        <div>{lives} lives</div>
      </Label>

      <Label>
        <Icon src={battleImage} />
        <div>round {wins + 1}</div>
      </Label>
    </Row>
  );
}
