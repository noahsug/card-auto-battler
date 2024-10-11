import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import BattleResultOverlay from './BattleResultOverlay';
import { createGameState } from '../../game/gameState';
import { MAX_WINS } from '../../game/constants';

const meta = {
  title: 'BattleResultOverlay',
  component: BattleResultOverlay,
  parameters: {
    gameState: createGameState(),
  },
  args: {
    onContinue: fn(),
    wonLastBattle: true,
  },
} satisfies Meta<typeof BattleResultOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Victory: Story = {};

export const Defeat: Story = {
  args: {
    wonLastBattle: false,
  },
};

export const GameOver: Story = {
  parameters: {
    gameState: {
      ...createGameState(),
      lives: 0,
    },
  },
};

export const YouWin: Story = {
  parameters: {
    gameState: {
      ...createGameState(),
      wins: MAX_WINS,
    },
  },
};
