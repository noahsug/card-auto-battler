import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { createGameState } from '../../../game/gameState';
import { getRandomRelics } from '../../../game/utils/relics';
import { CardRemovalScreen } from './CardRemovalScreen';

const meta = {
  title: 'CardRemovalScreen',
  component: CardRemovalScreen,
  args: {
    onViewDeck: fn,
  },
} satisfies Meta<typeof CardRemovalScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

const game = createGameState();
game.user.relics = getRandomRelics(3);

export const Primary: Story = {
  args: {
    game,
    onCardsSelected: fn,
  },
};
