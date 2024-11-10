import type { Meta, StoryObj } from '@storybook/react';

import { createBattleEvent, createCardEvent } from '../../../game/actions/battleEvent';
import { getRandomCards } from '../../../game/utils/cards';
import { CardStack } from './CardStack';

const meta = {
  title: 'CardStack',
  component: CardStack,
  args: {
    cards: getRandomCards(3),
    currentCardIndex: 0,
    opponentRect: new DOMRect(400, 200, 0, 0),
    onAnimationComplete(type) {
      console.log(type);
    },
  },
} satisfies Meta<typeof CardStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StartBattle: Story = {
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
