import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import BattleControls from './BattleControls';

const meta = {
  title: 'BattleControls',
  component: BattleControls,
} satisfies Meta<typeof BattleControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    onBack: fn(),
    onTogglePlay: fn(),
    onNext: fn(),
    canGoBack: true,
    isPlaying: true,
  },
};
