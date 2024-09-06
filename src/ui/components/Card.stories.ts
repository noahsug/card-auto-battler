import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import Card from './Card';
import { Button } from '../../stories/Button';

const meta = {
  title: 'Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
