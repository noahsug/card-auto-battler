import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { createGameState } from '../../../game/gameState';
import { getRandomRelics } from '../../../testing/utils';
import { RelicSelectionScreen } from './RelicSelectionScreen';
import { relicsByName } from '../../../content/relics';
import { getCardAddOptions, getRelicAddOptions } from '../../../game/actions';

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
  args: (() => {
    const game = createGameState();
    const relics = getRelicAddOptions(game);
    return { game, relics };
  })(),
};

export const AllRelics: Story = {
  args: {
    game: createGameState(),
    relics: Object.values(relicsByName),
  },
};
