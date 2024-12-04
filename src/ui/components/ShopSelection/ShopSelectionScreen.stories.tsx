import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { getShopOptions } from '../../../game/actions/actions';
import { createGameState } from '../../../game/gameState';
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

export const Primary: Story = {
  args: (() => {
    const game = createGameState();
    game.wins = 2;
    const shopOptions = getShopOptions(game);
    return { game, shopOptions };
  })(),
};
