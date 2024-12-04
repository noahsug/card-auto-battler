import { ShopType } from '../../../game/gameState';
import { Button } from '../shared/Button';

interface Props {
  shopType: ShopType;
  onShopSelected: () => void;
}

const shopNamesByType: Record<ShopType, string> = {
  addPotions: 'Add Potions',
  addRelics: 'Add Relics',
  chainCards: 'Chain Cards',
  removeCards: 'Remove Cards',
  featherCards: 'Lighten Cards',
};

export function ShopOption({ shopType, onShopSelected }: Props) {
  return <Button onClick={onShopSelected}>{shopNamesByType[shopType]}</Button>;
}
