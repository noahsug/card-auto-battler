import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { createGameState } from '../../../game/gameState';
import { getRandomCards } from '../../../game/utils/cards';
import { CardSelectionScreen } from './CardSelectionScreen';
import { cardsByName } from '../../../content/cards';

const meta = {
  title: 'CardSelectionScreen',
  component: CardSelectionScreen,
  args: {
    onViewDeck: fn,
  },
} satisfies Meta<typeof CardSelectionScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    game: createGameState(),
    cards: getRandomCards(6),
    onCardsSelected: fn,
  },
};

export const AllCards: Story = {
  args: {
    game: createGameState(),
    cards: Object.values(cardsByName),
    onCardsSelected: fn,
  },
};
