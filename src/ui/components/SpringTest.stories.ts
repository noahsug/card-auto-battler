import type { Meta, StoryObj } from '@storybook/react';

import SpringTest from './SpringTest';

const meta = {
  title: 'SpringTest',
  component: SpringTest,
} satisfies Meta<typeof SpringTest>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    currentCardIndex: 0,
  },
};
