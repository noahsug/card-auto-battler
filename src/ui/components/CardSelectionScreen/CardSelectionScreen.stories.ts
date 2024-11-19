import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { createGameState } from '../../../game/gameState';
import { getRandomCards } from '../../../game/utils/cards';
import { CardSelectionScreen } from './CardSelectionScreen';
import { cardsByName } from '../../../content/cards';
import { getRandomRelics } from '../../../game/utils/relics';

const meta = {
  title: 'CardSelectionScreen',
  component: CardSelectionScreen,
  args: {
    onViewDeck: fn,
  },
} satisfies Meta<typeof CardSelectionScreen>;

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
