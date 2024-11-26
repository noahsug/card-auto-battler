import { ShopName } from '../../../game/actions/actions';
import { Button } from '../shared/Button';

interface Props {
  name: ShopName;
  onShopSelected: () => void;
}

export function ShopOption({ name, onShopSelected }: Props) {
  return <Button onClick={onShopSelected}>{name}</Button>;
}
