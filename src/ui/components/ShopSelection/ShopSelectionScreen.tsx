import { styled } from 'styled-components';
import { GameState } from '../../../game/gameState';
import { ShopName } from '../../../game/utils/selectors';
import { HUD } from '../HUD';
import { ScrollingCenterContent } from '../shared/CenterContent';
import { Container } from '../shared/Container';
import { ShopOption } from './ShopOption';

interface Props {
  game: GameState;
  shopA: ShopName;
  shopB: ShopName;
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

export function ShopSelectionScreen({ game, shopA, shopB, onViewDeck, onShopSelected }: Props) {
  return (
    <Container>
      <HUD game={game} onViewDeck={onViewDeck} />
      <ScrollingCenterContent>
        <ShopList>
          <ShopOption name={shopA} onShopSelected={() => onShopSelected(shopA)} />
          <ShopOption name={shopB} onShopSelected={() => onShopSelected(shopB)} />
        </ShopList>
      </ScrollingCenterContent>
    </Container>
  );
}
