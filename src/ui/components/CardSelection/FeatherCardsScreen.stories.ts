import type { Meta, StoryObj } from '@storybook/react';
import sample from 'lodash/sample';
import { fn } from '@storybook/test';

import { createGameState } from '../../../game/gameState';
import { getRandomCards } from '../../../testing/utils';
import { FeatherCardsScreen } from './FeatherCardsScreen';

const meta = {
  title: 'FeatherCardsScreen',
  component: FeatherCardsScreen,
  args: {
    onViewDeck: fn(),
    onCardsSelected: fn(),
  },
} satisfies Meta<typeof FeatherCardsScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

const game = createGameState();

export const Primary: Story = {
  args: {
    game,
    cards: game.user.cards,
  },
};

export const HasExistingFeather: Story = {
  args: (() => {
    const game = createGameState();
    game.user.cards = getRandomCards(6);
    sample(game.user.cards)!.charm = 'feather';
    return { game, cards: game.user.cards };
  })(),
};
