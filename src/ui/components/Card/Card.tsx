import { styled, ThemeProvider } from 'styled-components';

import { CardState, Tribe } from '../../../game/gameState';
import { getHandDrawnBorderRadius, maskImage } from '../../style';
import { Container } from '../shared/Container';
import textBackground from './text-background.png';
import { DescriptionText } from '../DescriptionText';
import { parseCardDescriptionTemplate } from './parseCardDescriptionTemplate';
import { getCardColor } from './getCardColor';
import { Image } from '../shared/Image';
import chainImage from './chain.png';
import featherImage from './feather.png';

export const baseCardSize = { width: 12, height: 20 };

export const cardSizeScaling = {
  small: 0.7,
  medium: 0.8,
  large: 1.1,
};

const CardRoot = styled.div<{ $size: Props['size'] }>`
  font-size: ${({ $size }) => cardSizeScaling[$size]}rem;
`;

function getTitleColor(tribe: Tribe) {
  return getCardColor(tribe, { brighten: 10 });
}
function getBorderColor(tribe: Tribe) {
  return getCardColor(tribe, { saturate: 10, brighten: -65 });
}
function getTitleBackgroundColor(tribe: Tribe) {
  const saturate = tribe === 'basic' ? 0 : 30;
  return getCardColor(tribe, { saturate, brighten: -60 });
}

const OuterContainer = styled(Container)`
  height: ${baseCardSize.height}em;
  width: ${baseCardSize.width}em;
  text-align: center;
  color: var(--color-bg);
  background-color: ${(props) => getCardColor(props.theme.tribe)};
  ${getHandDrawnBorderRadius}
  border: solid 0.45em ${(props) => getBorderColor(props.theme.tribe)};
  padding: 0;
  position: relative;
`;

const Title = styled('h2')`
  width: 95%;
  ${maskImage({ src: textBackground })};
  color: ${(props) => getTitleColor(props.theme.tribe)};
  height: 1.15em;
  background-color: ${(props) => getTitleBackgroundColor(props.theme.tribe)};
  position: absolute;
  inset: 50% 0 0;
`;

const CardImage = styled(Image)`
  background: radial-gradient(white 0%, ${(props) => getCardColor(props.theme.tribe)} 60%);
  height: 55%;
`;

const Text = styled.div`
  padding: 0.25em 0.25em 0;
  margin: auto;
  width: 100%;

  > div + div {
    margin-top: 0.2em;
  }
`;

const ImageBorder = styled.div`
  filter: drop-shadow(0 0 0.1em black) drop-shadow(0 0 0.1em black);
`;

const charmColor = '#f3f382';

const ChainOverlayContainer = styled(ImageBorder)<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 51%;
  ${({ $side }) => $side}: -0.5em;
`;

const ChainOverlayImage = styled.div`
  width: 2em;
  height: 2em;
  ${maskImage({ src: chainImage })}
  background-color: ${charmColor}
`;

const ChainOverlay = ({ side }: { side: 'left' | 'right' }) => (
  <ChainOverlayContainer $side={side}>
    <ChainOverlayImage />
  </ChainOverlayContainer>
);

const FeatherOverlayContainer = styled(ImageBorder)`
  position: absolute;
  top: 1em;
  right: -0.5em;
  rotate: -45deg;
`;

const FeatherOverlayImage = styled.div`
  width: 3em;
  height: 3em;
  ${maskImage({ src: featherImage })};
  background-color: ${charmColor};
`;

const FeatherOverlay = () => (
  <FeatherOverlayContainer>
    <FeatherOverlayImage />
  </FeatherOverlayContainer>
);

interface Props {
  card: CardState;
  size: 'small' | 'medium' | 'large';
  onClick?: (event: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export function Card({ size, card, onClick, style }: Props) {
  const { name, image } = card;
  const description = parseCardDescriptionTemplate(card);

  return (
    <CardRoot $size={size} className="card" onClick={onClick} style={style}>
      <ThemeProvider theme={{ tribe: card.tribe }}>
        <OuterContainer>
          <CardImage src={image} alt="{name}" />
          <Title>{name}</Title>
          <Text>
            <DescriptionText text={description} />
          </Text>
          {card.chain.fromId != null && <ChainOverlay side="left" />}
          {card.chain.toId != null && <ChainOverlay side="right" />}
          {card.charm === 'feather' && <FeatherOverlay />}
        </OuterContainer>
      </ThemeProvider>
    </CardRoot>
  );
}
