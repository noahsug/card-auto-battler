import { styled } from 'styled-components';
import { GameState } from '../../../game/gameState';
import { ShopName } from '../../../game/actions/actions';
import { HUD } from '../HUD';
import { ScrollingCenterContent, CenterContent } from '../shared/CenterContent';
import { Container } from '../shared/Container';
import { ShopOption } from './ShopOption';

interface Props {
  game: GameState;
  shopOptions: ShopName[];
  onViewDeck: () => void;
  onShopSelected: (shop: ShopName) => void;
}

const CenterContentWithMargin = styled(CenterContent)`
  margin: auto;
`;

const size = 'max(2.5rem, 8vmin)';

const Message = styled.h2`
  margin-bottom: ${size};
  font-size: ${size};
`;

const ShopOptions = styled.div`
  > * {
    display: block;
    margin: 2rem 0;
  }
`;

export function ShopSelectionScreen({ game, shopOptions, onViewDeck, onShopSelected }: Props) {
  return (
    <Container>
      <HUD game={game} onViewDeck={onViewDeck} />
      <CenterContentWithMargin>
        <Message>select a boon</Message>
        <ShopOptions>
          {shopOptions.map((shop) => (
            <ShopOption key={shop} name={shop} onShopSelected={() => onShopSelected(shop)} />
          ))}
        </ShopOptions>
      </CenterContentWithMargin>
    </Container>
  );
}
