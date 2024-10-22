import { styled } from 'styled-components';
import { RelicState } from '../../../game/gameState';
import { Row } from '../shared/Row';
import { getHandDrawnBorderRadius } from '../../style';

interface Props {
  relic: RelicState;
  onClick?: (event: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

const TextContainer = styled.div`
  flex: 1;
  height: 100%;
  padding: 0.5rem 0.25rem;
`;

const Root = styled(Row)`
  background-color: var(--color-bg-light);
  ${getHandDrawnBorderRadius}
  border: solid 0.5em var(--color-bg-light);
`;

const Image = styled.img`
  height: 6rem;
  margin-right: 0.5rem;
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
      <Image src={relic.image} alt={relic.name} />
      <TextContainer>
        <Title>{relic.name}</Title>
        <Text>{relic.description}</Text>
      </TextContainer>
    </Root>
  );
}
