import type { Meta, StoryObj } from '@storybook/react';

import '../index.css';
import Card from './Card';

const meta = {
  title: 'Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Large: Story = {
  args: {
    size: 'large',
  },
};
export const Medium: Story = {
  args: {
    size: 'medium',
  },
};
export const Small: Story = {
  args: {
    size: 'small',
  },
};
