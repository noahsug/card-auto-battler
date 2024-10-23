import { styled, ThemeProvider } from 'styled-components';

import { CardState } from '../../../game/gameState';
import { getHandDrawnBorderRadius, maskImage } from '../../style';
import { Container } from '../shared/Container';
import textBackground from './text-background.png';
import { DescriptionText } from '../DescriptionText';

export const baseCardSize = { width: 12, height: 20 };

export const cardSizeScaling = {
  small: 0.7,
  medium: 0.8,
  large: 1.2,
};

const CardRoot = styled.div<{ $size: Props['size'] }>`
  font-size: ${({ $size }) => cardSizeScaling[$size]}rem;
`;

const hsl = {
  regular: [67, 18, 85],
  red: [0, 20, 78],
  green: [118, 15, 73],
};
function getHSLString(hue: number, saturation: number, lightness: number) {
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}
function getBackgroundColor(color: CardColor) {
  const [hue, saturation, lightness] = hsl[color];
  return getHSLString(hue, saturation, lightness);
}
function getTitleColor(color: CardColor) {
  const [hue, saturation] = hsl[color];
  let lightness = hsl[color][2];
  lightness += 10;
  return getHSLString(hue, saturation, lightness);
}
function getBorderColor(color: CardColor) {
  const [hue, saturation] = hsl[color];
  let lightness = hsl[color][2];
  lightness = 15;
  return getHSLString(hue, saturation, lightness);
}

const OuterContainer = styled(Container)`
  height: ${baseCardSize.height}em;
  width: ${baseCardSize.width}em;
  text-align: center;
  color: var(--color-bg);
  background-color: ${(props) => getBackgroundColor(props.theme.color)};
  ${getHandDrawnBorderRadius}
  border: solid 0.5em ${(props) => getBorderColor(props.theme.color)};
  padding: 0;
  position: relative;
`;

const Title = styled('h2')`
  width: 95%;
  ${maskImage({ src: textBackground })};
  color: ${(props) => getTitleColor(props.theme.color)};
  height: 1.15em;
  background-color: var(--color-bg);
  position: absolute;
  inset: 49.5% 0 0;
`;

const Image = styled.img`
  height: 55%;
  object-fit: cover;
  object-position: center;
  border-bottom: solid 0.25em ${(props) => getBorderColor(props.theme.color)};
`;

const Text = styled.div`
  padding: 0.25em 0.25em 0;
  margin: auto;
  width: 100%;

  > div + div {
    margin-top: 0.2em;
  }
`;

interface Props {
  card: CardState;
  size: 'small' | 'medium' | 'large';
  color?: CardColor;
  onClick?: (event: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

type CardColor = 'regular' | 'red' | 'green';

export function Card({ size, color = 'regular', card, onClick, style }: Props) {
  const { name, description, image } = card;

  return (
    <CardRoot $size={size} className="card" onClick={onClick} style={style}>
      <ThemeProvider theme={{ color }}>
        <OuterContainer>
          <Image src={image} alt="{name}" />
          <Title>{name}</Title>
          <Text>
            <DescriptionText text={description} />
          </Text>
        </OuterContainer>
      </ThemeProvider>
    </CardRoot>
  );
}
