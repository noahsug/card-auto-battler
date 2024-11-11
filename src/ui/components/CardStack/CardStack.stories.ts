import type { Meta, StoryObj } from '@storybook/react';

import { createBattleEvent, createCardEvent } from '../../../game/actions/battleEvent';
import { getRandomCards } from '../../../game/utils/cards';
import { CardStack } from './CardStack';
import { fn } from '@storybook/test';

const meta = {
  title: 'CardStack',
  component: CardStack,
  args: {
    cards: getRandomCards(3),
    currentCardIndex: 0,
    opponentBoundingRect: new DOMRect(400, 200, 0, 0),
    onAnimationComplete() {
      console.log('animation complete');
    },
  },
} satisfies Meta<typeof CardStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PlayCard: Story = {
  args: {
    events: [createCardEvent('playCard', 0)],
  },
};

export const TakeTurn: Story = {
  args: {
    events: [
      createBattleEvent('startBattle'),
      createCardEvent('playCard', 0),
      createCardEvent('discardCard', 0),
      createCardEvent('playCard', 1),
      createCardEvent('trashCard', 1),
      createCardEvent('playCard', 2),
      createCardEvent('discardCard', 2),
      createBattleEvent('shuffle'),
    ],
  },
};
