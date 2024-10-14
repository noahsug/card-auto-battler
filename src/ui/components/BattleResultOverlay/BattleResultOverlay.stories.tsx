import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { BattleResultOverlay } from './BattleResultOverlay';
import { createGameState } from '../../../game/gameState';
import { MAX_LOSSES, MAX_WINS } from '../../../game/constants';

const meta = {
  title: 'BattleResultOverlay',
  component: BattleResultOverlay,
  args: {
    onContinue: fn(),
    wonLastBattle: true,
    game: createGameState(),
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
  args: {
    game: {
      ...createGameState(),
      losses: MAX_LOSSES,
    },
  },
};

export const YouWin: Story = {
  args: {
    game: {
      ...createGameState(),
      wins: MAX_WINS,
    },
  },
};
