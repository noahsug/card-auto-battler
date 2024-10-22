import { styled } from 'styled-components';
import { RelicState } from '../../../game/gameState';
import { Row } from '../shared/Row';

interface Props {
  relic: RelicState;
  onClick?: (event: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

const TextContainer = styled('div')`
  flex: 1;
  padding: 0.25rem;
`;

const Root = styled(Row)`
  background-color: var(--color-bg);
`;

const Title = styled('h2')`
  color: var(--color-primary);
`;

const Text = styled.div``;

export function Relic({ relic, onClick, style }: Props) {
  return (
    <Root onClick={onClick} style={style}>
      <img src={relic.image} alt={relic.name} />
      <TextContainer>
        <Title>{relic.name}</Title>
        <Text>{relic.description}</Text>
      </TextContainer>
    </Root>
  );
}
