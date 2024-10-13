import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { BattleControls } from './BattleControls';

const meta = {
  title: 'BattleControls',
  component: BattleControls,
} satisfies Meta<typeof BattleControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Enabled: Story = {
  args: {
    onBack: fn(),
    onTogglePlay: fn(),
    onNext: fn(),
    isPlaying: true,
  },
};

export const Disabled: Story = {
  args: {
    isPlaying: false,
  },
};
