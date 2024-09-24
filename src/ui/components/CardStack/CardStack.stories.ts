import type { Meta, StoryObj } from '@storybook/react';

import { CardStack } from './CardStack';
import { getRandomCards } from '../../../game/utils';
import { CardState } from '../../../game/gameState';

const meta = {
  title: 'CardStack',
  component: CardStack,
} satisfies Meta<typeof CardStack>;

export default meta;
type Story = StoryObj<typeof meta>;

function getStory(cards: CardState[]): Story {
  return {
    args: {
      currentCardIndex: 0,
      targetElement: null,
      playerType: 'user',
      turn: 0,
      cards,
    },
  };
}

export const ManyCards: Story = getStory(getRandomCards(20));
export const SomeCards: Story = getStory(getRandomCards(5));
export const CoupleCards: Story = getStory(getRandomCards(2));
