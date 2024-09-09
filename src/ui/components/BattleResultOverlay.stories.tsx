import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import BattleResultOverlay from './BattleResultOverlay';
import { createGameState } from '../../game/gameState';

const meta = {
  title: 'BattleResultOverlay',
  component: BattleResultOverlay,
  parameters: {
    gameState: {
      ...createGameState(),
    },
  },
  args: {
    onNewGame: fn(),
  },
} satisfies Meta<typeof BattleResultOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Victory: Story = {
  parameters: {
    gameState: {
      ...createGameState(),
      won: true,
    },
  },
};

export const Defeat: Story = {
  parameters: {
    gameState: {
      ...createGameState(),
      won: false,
    },
  },
};
