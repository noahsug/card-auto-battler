import { styled } from 'styled-components';

import { RelicState, Tribe } from '../../../game/gameState';
import { getHandDrawnBorderRadius, maskImage } from '../../style';
import { Row } from '../shared/Row';
import { DescriptionText } from '../DescriptionText';
import { parseRelicDescriptionTemplate } from './parseRelicDescriptionTemplate';

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

function getHue({ $tribe }: { $tribe: Tribe }) {
  switch ($tribe) {
    case 'basic':
      return 67;
    case 'green':
      return 142;
    case 'red':
      return 0;
    case 'purple':
      return 250;
  }
  $tribe satisfies never;
}

function getSaturation({ $tribe }: { $tribe: Tribe }) {
  return $tribe === 'basic' ? 0 : 20;
}

export const RelicImage = styled.div<{ src: string; $tribe: Tribe }>`
  width: 6rem;
  height: 6rem;
  ${maskImage}
  background-color: hsl(${getHue}, ${getSaturation}%, 75%);
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
  const description = parseRelicDescriptionTemplate(relic);
  return (
    <Root onClick={onClick} style={style}>
      <RelicImage src={relic.image} $tribe={relic.tribe} />
      <TextContainer>
        <Title>{relic.name}</Title>
        <Text>
          <DescriptionText text={description} />
        </Text>
      </TextContainer>
    </Root>
  );
}
