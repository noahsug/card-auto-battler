import type { Meta, StoryObj } from '@storybook/react';

import Card from './Card';

const meta = {
  title: 'Card',
  component: Card,
  parameters: {
    args: {
      size: 'large',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const User: Story = {
  args: {
    size: 'large',
    type: 'user',
  },
};
export const EnemyRed: Story = {
  args: {
    size: 'large',
    type: 'enemyRed',
  },
};
export const EnemyGreen: Story = {
  args: {
    size: 'large',
    type: 'enemyGreen',
  },
};
