import { styled } from 'styled-components';

import { RelicState } from '../../../game/gameState';
import { getHandDrawnBorderRadius, maskImage } from '../../style';
import { Row } from '../shared/Row';

interface Props {
  relic: RelicState;
  onClick?: (event: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

const TextContainer = styled.div`
  flex: 1;
  height: 100%;
  padding: 0.5rem 0.25rem;
  margin-left: 0.5rem;
`;

const Root = styled(Row)`
  background-color: var(--color-bg-light);
  ${getHandDrawnBorderRadius}
  border: solid 0.5em var(--color-bg-light);
`;

export const RelicImage = styled.div<{ src: string; $color: string }>`
  width: 6rem;
  height: 6rem;
  ${maskImage}
  background-color: ${(props) => props.$color};
`;

const Title = styled('h2')`
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  font-size: 1.6rem;
`;

const Text = styled.div`
  flex: 1;
  font-size: 1.1rem;
`;

export function Relic({ relic, onClick, style }: Props) {
  return (
    <Root onClick={onClick} style={style}>
      <RelicImage src={relic.image} $color={relic.color} />
      <TextContainer>
        <Title>{relic.name}</Title>
        <Text>{relic.description}</Text>
      </TextContainer>
    </Root>
  );
}
