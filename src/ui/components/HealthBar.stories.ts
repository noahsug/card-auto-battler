import type { Meta, StoryObj } from '@storybook/react';

import HealthBar from './HealthBar';

const meta = {
  title: 'HealthBar',
  component: HealthBar,
} satisfies Meta<typeof HealthBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Full: Story = {
  args: {
    maxHealth: 10,
    health: 10,
  },
};
export const Half: Story = {
  args: {
    maxHealth: 10,
    health: 5,
  },
};
export const Empty: Story = {
  args: {
    maxHealth: 10,
    health: 0,
  },
};
export const MoreThanFull: Story = {
  args: {
    maxHealth: 10,
    health: 20,
  },
};
