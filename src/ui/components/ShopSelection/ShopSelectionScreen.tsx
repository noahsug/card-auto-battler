import { styled } from 'styled-components';
import { GameState } from '../../../game/gameState';
import { ShopName } from '../../../game/actions/actions';
import { HUD } from '../HUD';
import { ScrollingCenterContent } from '../shared/CenterContent';
import { Container } from '../shared/Container';
import { ShopOption } from './ShopOption';

interface Props {
  game: GameState;
  shopOptions: ShopName[];
  onViewDeck: () => void;
  onShopSelected: (shop: ShopName) => void;
}

const ShopList = styled.div`
  display: flex;
  flex-direction: row;
  overflow-y: auto;

  > * {
    margin: 1.5rem 0.5rem;
  }
`;

export function ShopSelectionScreen({ game, shopOptions, onViewDeck, onShopSelected }: Props) {
  return (
    <Container>
      <HUD game={game} onViewDeck={onViewDeck} />
      <ScrollingCenterContent>
        <ShopList>
          {shopOptions.map((shop) => (
            <ShopOption key={shop} name={shop} onShopSelected={() => onShopSelected(shop)} />
          ))}
        </ShopList>
      </ScrollingCenterContent>
    </Container>
  );
}
