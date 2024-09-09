import { styled } from 'styled-components';

import Container from './shared/Container';
import suckerPunchImage from '../images/cards/sucker-punch.png';
import textBackground from '../images/text-background.png';
import { getHandDrawnBorderRadius, maskImage } from '../style';

interface Props {
  size: 'small' | 'medium' | 'large';
  type: 'user' | 'enemyRed' | 'enemyGreen';
}

export default function Card({ size, type }: Props) {
  return (
    <Root size={size}>
      <OuterContainer type={type}>
        <Title type={type}>Sucker Punch</Title>
        <Image src={suckerPunchImage} />
        <Text>
          <div>
            Deal <Value>3</Value> damage.
          </div>
          <div>Deal double damage if the enemy played at least two cards last turn.</div>
        </Text>
      </OuterContainer>
    </Root>
  );
}

const Root = styled.div<{ size: Props['size'] }>`
  font-size: ${({ size }) => {
    switch (size) {
      case 'small':
        return '0.8rem';
      case 'medium':
        return '1rem';
      case 'large':
        return '2.5rem';
    }
  }};
`;

const hsl = {
  user: [67, 18, 85],
  enemyRed: [0, 60, 78],
  enemyGreen: [118, 20, 73],
};

function getCardColor({ type, isTitle }: { type: Props['type']; isTitle: boolean }) {
  let [hue, saturation, lightness] = hsl[type];
  if (isTitle) {
    lightness += 10;
  }
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

function getCardBackgroundColor({ type }: { type: Props['type'] }) {
  return getCardColor({ type, isTitle: false });
}
function getCardTitleColor({ type }: { type: Props['type'] }) {
  return getCardColor({ type, isTitle: true });
}

const OuterContainer = styled(Container)<{ type: Props['type'] }>`
  height: 20em;
  width: 12em;
  text-align: center;
  color: var(--color-bg);
  background-color: ${getCardBackgroundColor};
  ${getHandDrawnBorderRadius}
  border: solid 0.5em var(--color-bg);
  padding: 0.5em 0;
`;

const Title = styled('h2')<{ type: Props['type'] }>`
  width: 95%;
  ${maskImage({ src: textBackground })}
  color: ${getCardTitleColor};
  height: 1.2em;
  background-color: var(--color-bg);
`;

const Image = styled.img`
  height: 9em;
  object-fit: cover;
`;

const Text = styled.div`
  padding: 0.5em 0.25em 0;
  margin: auto;

  > div + div {
    margin-top: 0.2em;
  }
`;

const Value = styled.span`
  font-weight: bold;
  font-size: 1.1em;
`;
