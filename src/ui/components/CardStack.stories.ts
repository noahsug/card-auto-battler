import type { Meta, StoryObj } from '@storybook/react';

import CardStack from './CardStack';
import { getRandomCards } from '../../game/utils';

const meta = {
  title: 'CardStack',
  component: CardStack,
} satisfies Meta<typeof CardStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ManyCards: Story = {
  args: {
    currentCardIndex: 0,
    target: null,
    playerType: 'user',
    cards: getRandomCards(20),
  },
};

export const SomeCards: Story = {
  args: {
    currentCardIndex: 0,
    target: null,
    playerType: 'user',
    cards: getRandomCards(5),
  },
};

export const CoupleCards: Story = {
  args: {
    cards: getRandomCards(2),
    currentCardIndex: 0,
    target: null,
    playerType: 'user',
  },
};
