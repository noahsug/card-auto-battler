import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { createGameState } from '../../../game/gameState';
import { getRandomRelics } from '../../../testing/utils';
import { RelicSelectionScreen } from './RelicSelectionScreen';
import { relicsByName } from '../../../content/relics';

const meta = {
  title: 'RelicSelectionScreen',
  component: RelicSelectionScreen,
  args: {
    onViewDeck: fn(),
    onRelicSelected: fn(),
  },
} satisfies Meta<typeof RelicSelectionScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    game: createGameState(),
    relics: getRandomRelics(3),
  },
};

export const AllRelics: Story = {
  args: {
    game: createGameState(),
    relics: Object.values(relicsByName),
  },
};
