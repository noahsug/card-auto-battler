import type { Meta, StoryObj } from '@storybook/react';

import StartScreen from './StartScreen';

const meta = {
  title: 'StartScreen',
  component: StartScreen,
} satisfies Meta<typeof StartScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    onNewGame: () => {},
  },
};
