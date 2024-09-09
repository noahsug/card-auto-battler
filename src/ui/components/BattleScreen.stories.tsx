import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import BattleScreen from './BattleScreen';
import { createGameState } from '../../game/gameState';
import { AppRoot } from './App';
import { ScreenContainerRoot } from './ScreenContainer';

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
    gameState: {
      ...createGameState(),
    },
  },
  args: {
    onBattleOver: fn(),
  },
} satisfies Meta<typeof BattleScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  parameters: {
    gameState: {
      ...createGameState(),
    },
  },
};
