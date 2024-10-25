import { styled, ThemeProvider } from 'styled-components';

import { CardState, CardColor } from '../../../game/gameState';
import { getHandDrawnBorderRadius, maskImage } from '../../style';
import { Container } from '../shared/Container';
import textBackground from './text-background.png';
import { DescriptionText } from '../DescriptionText';
import { parseDescriptionTemplate } from './parseDescriptionTemplate';
import { getCardColor } from './cardColor';

export const baseCardSize = { width: 12, height: 20 };

export const cardSizeScaling = {
  small: 0.7,
  medium: 0.8,
  large: 1.2,
};

const CardRoot = styled.div<{ $size: Props['size'] }>`
  font-size: ${({ $size }) => cardSizeScaling[$size]}rem;
`;

function getTitleColor(color: CardColor) {
  return getCardColor(color, { brighten: 10 });
}
function getBorderColor(color: CardColor) {
  return getCardColor(color, { brighten: -62 });
}

const OuterContainer = styled(Container)`
  height: ${baseCardSize.height}em;
  width: ${baseCardSize.width}em;
  text-align: center;
  color: var(--color-bg);
  background-color: ${(props) => getCardColor(props.theme.color)};
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
  background: radial-gradient(white 0%, ${(props) => getCardColor(props.theme.color)} 80%);
  height: 55%;
  object-fit: cover;
  object-position: center;
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
  onClick?: (event: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export function Card({ size, card, onClick, style }: Props) {
  const { name, image } = card;
  const description = parseDescriptionTemplate(card);

  return (
    <CardRoot $size={size} className="card" onClick={onClick} style={style}>
      <ThemeProvider theme={{ color: card.color }}>
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
