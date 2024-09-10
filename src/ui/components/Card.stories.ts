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

export const Punch: Story = {
  args: {
    size: 'large',
    type: 'user',
    card: 'punch',
  },
};
export const Fireball: Story = {
  args: {
    size: 'large',
    type: 'red',
    card: 'fireball',
  },
};
export const Eviscerate: Story = {
  args: {
    size: 'large',
    type: 'user',
    card: 'eviscerate',
  },
};
