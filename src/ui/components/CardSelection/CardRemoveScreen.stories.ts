import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { createGameState } from '../../../game/gameState';
import { getRandomRelics } from '../../../testing/utils';
import { CardRemoveScreen } from './CardRemoveScreen';

const meta = {
  title: 'CardRemoveScreen',
  component: CardRemoveScreen,
  args: {
    onViewDeck: fn,
    onCardsSelected: fn,
  },
} satisfies Meta<typeof CardRemoveScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

const game = createGameState();
game.user.relics = getRandomRelics(3);

export const Primary: Story = {
  args: {
    game,
  },
};
