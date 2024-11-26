import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { createGameState } from '../../../game/gameState';
import { getRandomRelics } from '../../../testing/utils';
import { RemoveCardsScreen } from './RemoveCardsScreen';

const meta = {
  title: 'RemoveCardsScreen',
  component: RemoveCardsScreen,
  args: {
    onViewDeck: fn(),
    onCardsSelected: fn(),
  },
} satisfies Meta<typeof RemoveCardsScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

const game = createGameState();
game.user.relics = getRandomRelics(3);

export const Primary: Story = {
  args: {
    game,
  },
};
