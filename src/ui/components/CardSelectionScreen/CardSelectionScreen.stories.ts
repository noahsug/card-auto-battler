import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { createGameState } from '../../../game/gameState';
import { getRandomCards } from '../../../game/utils/getRandomCards';
import { CardSelectionScreen } from './CardSelectionScreen';

const meta = {
  title: 'CardSelectionScreen',
  component: CardSelectionScreen,
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
