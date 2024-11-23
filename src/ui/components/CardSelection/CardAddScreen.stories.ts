import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { cardsByName } from '../../../content/cards';
import { createGameState } from '../../../game/gameState';
import { getRandomCards, getRandomRelics } from '../../../testing/utils';
import { CardAddScreen } from './CardAddScreen';

const meta = {
  title: 'CardAddScreen',
  component: CardAddScreen,
  args: {
    onViewDeck: fn,
  },
} satisfies Meta<typeof CardAddScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

const game = createGameState();
game.user.relics = getRandomRelics(3);

export const Primary: Story = {
  args: {
    game,
    cards: getRandomCards(6),
    onCardsSelected: fn,
  },
};

export const AllCards: Story = {
  args: {
    game,
    cards: Object.values(cardsByName),
    onCardsSelected: fn,
  },
};
