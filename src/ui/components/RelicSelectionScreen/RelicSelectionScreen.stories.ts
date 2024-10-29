import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { createGameState } from '../../../game/gameState';
import { getRandomRelics } from '../../../game/utils/getRandomRelics';
import { RelicSelectionScreen } from './RelicSelectionScreen';
import { allRelics } from '../../../content/relics';

const meta = {
  title: 'RelicSelectionScreen',
  component: RelicSelectionScreen,
  args: {
    onViewDeck: fn,
  },
} satisfies Meta<typeof RelicSelectionScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    game: createGameState(),
    relics: getRandomRelics(3),
    onRelicSelected: fn,
  },
};

export const AllRelics: Story = {
  args: {
    game: createGameState(),
    relics: Object.values(allRelics),
    onRelicSelected: fn,
  },
};
