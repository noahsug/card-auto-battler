import type { Meta, StoryObj } from '@storybook/react';
import sample from 'lodash/sample';

import CardStack from './CardStack';
import { allCards } from '../../content/cards';

function getRandomCards(length: number) {
  const cards = new Array(length);
  const options = Object.values(allCards);

  for (let i = 0; i < length; i++) {
    cards[i] = sample(options);
  }
  return cards;
}

const meta = {
  title: 'CardStack',
  component: CardStack,
} satisfies Meta<typeof CardStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ManyCards: Story = {
  args: {
    cards: getRandomCards(20),
    currentCardIndex: 0,
    direction: 'left',
  },
};

export const SomeCards: Story = {
  args: {
    cards: getRandomCards(5),
    currentCardIndex: 0,
    direction: 'left',
  },
};

export const CoupleCards: Story = {
  args: {
    cards: getRandomCards(2),
    currentCardIndex: 0,
    direction: 'left',
  },
};
