import { styled, ThemeProvider } from 'styled-components';

import Container from './shared/Container';
import { getHandDrawnBorderRadius, maskImage } from '../style';

import textBackground from '../images/text-background.png';
import { CardState } from '../../game/gameState';

interface Props {
  size: 'small' | 'medium' | 'large';
  color: 'regular' | 'red' | 'green';
  card: CardState;
}

function CardTextLine({ text }: { text: string }) {
  const parts = text.split(/(\d+)/);
  return (
    <div>
      {parts.map((part, i) => {
        const isValue = /\d+/.test(part);
        return isValue ? <Value key={i}>{part}</Value> : part;
      })}
      .
    </div>
  );
}

export default function Card({ size, color: type, card }: Props) {
  const { name, description, image } = card;
  const lines = description.split('.').slice(0, -1);

  return (
    <CardRoot $size={size} className="card">
      <ThemeProvider theme={{ type }}>
        <OuterContainer>
          <Image src={image} alt="{name}" />
          <Title>{name}</Title>
          <Text>
            {lines.map((text, i) => (
              <CardTextLine text={text} key={i} />
            ))}
          </Text>
        </OuterContainer>
      </ThemeProvider>
    </CardRoot>
  );
}

const CardRoot = styled.div<{ $size: Props['size'] }>`
  font-size: ${({ $size }) => {
    switch ($size) {
      case 'small':
        return '0.5rem';
      case 'medium':
        return '0.8rem';
      case 'large':
        return '1.2rem';
    }
  }};
`;

const hsl = {
  regular: [67, 18, 85],
  red: [0, 20, 78],
  green: [118, 15, 73],
};
function getHSLString(hue: number, saturation: number, lightness: number) {
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}
function getBackgroundColor(type: Props['color']) {
  const [hue, saturation, lightness] = hsl[type];
  return getHSLString(hue, saturation, lightness);
}
function getTitleColor(type: Props['color']) {
  const [hue, saturation] = hsl[type];
  let lightness = hsl[type][2];
  lightness += 10;
  return getHSLString(hue, saturation, lightness);
}
function getBorderColor(type: Props['color']) {
  const [hue, saturation] = hsl[type];
  let lightness = hsl[type][2];
  lightness = 15;
  return getHSLString(hue, saturation, lightness);
}

const OuterContainer = styled(Container)`
  height: 20em;
  width: 12em;
  text-align: center;
  color: var(--color-bg);
  background-color: ${(props) => getBackgroundColor(props.theme.type)};
  ${getHandDrawnBorderRadius}
  border: solid 0.5em ${(props) => getBorderColor(props.theme.type)};
  padding: 0;
  position: relative;
`;

const Title = styled('h2')`
  width: 95%;
  ${maskImage({ src: textBackground })};
  color: ${(props) => getTitleColor(props.theme.type)};
  height: 1.15em;
  background-color: var(--color-bg);
  position: absolute;
  inset: 49.5% 0 0;
`;

const Image = styled.img`
  height: 55%;
  object-fit: cover;
  object-position: center;
  border-bottom: solid 0.25em ${(props) => getBorderColor(props.theme.type)};
`;

const Text = styled.div`
  padding: 0.25em 0.25em 0;
  margin: auto;
  width: 100%;

  > div + div {
    margin-top: 0.2em;
  }
`;

const Value = styled.span`
  font-weight: bold;
  font-size: 1.1em;
`;
