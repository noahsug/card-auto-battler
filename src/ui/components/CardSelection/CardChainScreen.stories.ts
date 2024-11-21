import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { createGameState } from '../../../game/gameState';
import { getRandomRelics } from '../../../game/utils/relics';
import { CardChainScreen } from './CardChainScreen';

const meta = {
  title: 'CardChainScreen',
  component: CardChainScreen,
  args: {
    onViewDeck: fn,
    onCardsSelected: fn,
  },
} satisfies Meta<typeof CardChainScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

const game = createGameState();
game.user.relics = getRandomRelics(3);

export const Primary: Story = {
  args: {
    game,
  },
};
