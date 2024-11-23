import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { allCards } from '../../../content/cards';
import { createGameState } from '../../../game/gameState';
import { ViewDeckOverlay } from './ViewDeckOverlay';

const meta = {
  title: 'ViewDeckOverlay',
  component: ViewDeckOverlay,
  args: {
    onClose: fn(),
  },
} satisfies Meta<typeof ViewDeckOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FewCards: Story = {
  args: {
    game: createGameState(),
  },
};

const manyCards = createGameState();
manyCards.user.cards = allCards;
export const AllCards: Story = {
  args: {
    game: manyCards,
  },
};
