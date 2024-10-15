import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { createGameState } from '../../../game/gameState';
import { getRandomCards } from '../../../game/utils/getRandomCards';
import { ViewDeckOverlay } from './ViewDeckOverlay';

const meta = {
  title: 'ViewDeckOverlay',
  component: ViewDeckOverlay,
  args: {
    onBack: fn,
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
manyCards.user.cards = getRandomCards(20);
export const ManyCards: Story = {
  args: {
    game: manyCards,
  },
};
