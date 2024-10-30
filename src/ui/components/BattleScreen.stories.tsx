import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { createGameState, statusEffectNames } from '../../game/gameState';
import { getRandomCards } from '../../game/utils/cards';
import { BattleScreen } from './BattleScreen';
import { getRandomRelics } from '../../game/utils/getRandomRelics';
import { allRelics } from '../../content/relics';

const meta = {
  title: 'BattleScreen',
  component: BattleScreen,
  args: {
    onBattleOver: fn(),
    onViewDeck: fn(),
    canUndo: () => false,
    undo: fn(),
    playCard: () => Promise.resolve([]),
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

const hasStatusEffectsAndRelics = createGameState();
statusEffectNames.forEach((effectName) => {
  hasStatusEffectsAndRelics.enemy[effectName] = 3;
});
hasStatusEffectsAndRelics.user.strength = -5;
hasStatusEffectsAndRelics.user.relics = Object.values(allRelics);
export const StatusEffectsAndRelics: Story = {
  args: {
    game: hasStatusEffectsAndRelics,
  },
};
