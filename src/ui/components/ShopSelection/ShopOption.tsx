import { ShopName } from '../../../game/actions/actions';
import { Button } from '../shared/Button';

interface Props {
  name: ShopName;
  onShopSelected: () => void;
}

const displayNames: Record<ShopName, string> = {
  addPotions: 'Add Potions',
  addRelics: 'Add Relics',
  chainCards: 'Chain Cards',
  removeCards: 'Remove Cards',
};

export function ShopOption({ name, onShopSelected }: Props) {
  return <Button onClick={onShopSelected}>{displayNames[name]}</Button>;
}
