import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { createGameState } from '../../game/gameState';
import { getRandomCards } from '../../game/utils/getRandomCards';
import { BattleScreen } from './BattleScreen';

const meta = {
  title: 'BattleScreen',
  component: BattleScreen,
  args: {
    onBattleOver: fn(),
  },
} satisfies Meta<typeof BattleScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FewCards: Story = {
  args: {
    game: createGameState(),
  },
};

const manyCards = createGameState();
manyCards.user.cards = getRandomCards(20);
export const ManyCards: Story = {
  args: {
    game: manyCards,
  },
};

const isDead = createGameState();
isDead.enemy.health = 0;
export const IsDead: Story = {
  args: {
    game: isDead,
  },
};
