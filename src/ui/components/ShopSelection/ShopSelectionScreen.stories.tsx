import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { createGameState } from '../../../game/gameState';
import { getNextShops, ShopName } from '../../../game/utils/selectors';
import { ShopSelectionScreen } from './ShopSelectionScreen';

const meta = {
  title: 'ShopSelectionScreen',
  component: ShopSelectionScreen,
  args: {
    onShopSelected: fn(),
    onViewDeck: fn(),
  },
} satisfies Meta<typeof ShopSelectionScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

// export const Primary: Story = {
//   args: (() => {
//     const game = createGameState();
//     game.wins = 1; // Ensure we have a shop
//     const [shopA, shopB] = getNextShops(game);
//     return { game, shopA, shopB };
//   })(),
// };

export const Primary: Story = {
  args: (() => {
    const game = createGameState();
    const [shopA, shopB]: ShopName[] = ['addPotions', 'removeCards'];
    return { game, shopA, shopB };
  })(),
};
