import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import BattleScreen from './BattleScreen';
import { createGameState } from '../../game/gameState';
import { AppRoot } from './App';
import { ScreenContainerRoot } from './ScreenContainer';
import { getRandomCards } from '../../game/utils';

const meta = {
  title: 'BattleScreen',
  component: BattleScreen,
  decorators: [
    (Story) => (
      <AppRoot>
        <ScreenContainerRoot>
          <Story />
        </ScreenContainerRoot>
      </AppRoot>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onBattleOver: fn(),
  },
} satisfies Meta<typeof BattleScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

const manyCards = createGameState();
manyCards.user.cards = getRandomCards(20);

export const Primary: Story = {
  parameters: {
    gameState: manyCards,
  },
};
