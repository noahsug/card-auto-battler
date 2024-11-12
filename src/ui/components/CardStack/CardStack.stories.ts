import type { Meta, StoryObj } from '@storybook/react';

import { createBattleEvent } from '../../../game/actions/battleEvent';
import { getRandomCards } from '../../../game/utils/cards';
import { CardStack } from './CardStack';

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
    events: [createBattleEvent('playCard', 0)],
  },
};

export const TakeTurn: Story = {
  args: {
    events: [
      createBattleEvent('startBattle'),
      createBattleEvent('playCard', 0),
      createBattleEvent('discardCard', 0),
      createBattleEvent('playCard', 1),
      createBattleEvent('trashCard', 1),
      createBattleEvent('playCard', 2),
      createBattleEvent('discardCard', 2),
      createBattleEvent('shuffle'),
    ],
  },
};
