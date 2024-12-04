import { ShopType } from '../../../game/gameState';
import { Button } from '../shared/Button';

interface Props {
  name: ShopType;
  onShopSelected: () => void;
}

const displayNames: Record<ShopType, string> = {
  addPotions: 'Add Potions',
  addRelics: 'Add Relics',
  chainCards: 'Chain Cards',
  removeCards: 'Remove Cards',
  featherCards: 'Lighten Cards',
};

export function ShopOption({ name, onShopSelected }: Props) {
  return <Button onClick={onShopSelected}>{displayNames[name]}</Button>;
}
