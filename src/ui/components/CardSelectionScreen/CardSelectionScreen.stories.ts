import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { CardSelectionScreen } from './CardSelectionScreen';
import { getRandomCards } from '../../../game/utils';

const meta = {
  title: 'CardSelectionScreen',
  component: CardSelectionScreen,
} satisfies Meta<typeof CardSelectionScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    cards: getRandomCards(6),
    onCardsSelected: fn,
  },
};
