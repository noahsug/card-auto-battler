import type { Meta, StoryObj } from '@storybook/react';

import { createBattleEvent } from '../../../game/actions/battleEvent';
import { getRandomCards } from '../../../testing/utils';
import { CardStack } from './CardStack';

const meta = {
  title: 'CardStack',
  component: CardStack,
  args: {
    cards: getRandomCards(3),
    currentCardIndex: 0,
    opponentBoundingRect: new DOMRect(400, 200, 0, 0),
    onAnimationComplete() {
      // console.log('animation complete');
    },
    isPaused: false,
    isFastForwarding: false,
  },
} satisfies Meta<typeof CardStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PlayCard: Story = {
  args: {
    events: [createBattleEvent('startPlayCard', 0)],
  },
};

export const TakeTurn: Story = {
  args: {
    events: [
      createBattleEvent('startBattle'),
      createBattleEvent('startPlayCard', 0),
      createBattleEvent('discardCard', 0),
      createBattleEvent('startPlayCard', 1),
      createBattleEvent('trashCard', 1),
      createBattleEvent('startPlayCard', 2),
      createBattleEvent('discardCard', 2),
      createBattleEvent('shuffle'),
    ],
  },
};
