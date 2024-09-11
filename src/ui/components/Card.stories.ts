import type { Meta, StoryObj } from '@storybook/react';

import Card from './Card';
import { allCards } from '../../content/cards';

const meta = {
  title: 'Card',
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Punch: Story = {
  args: {
    size: 'large',
    type: 'user',
    card: allCards.punch,
  },
};
export const Fireball: Story = {
  args: {
    size: 'large',
    type: 'red',
    card: allCards.fireball,
  },
};
export const Eviscerate: Story = {
  args: {
    size: 'large',
    type: 'user',
    card: allCards.eviscerate,
  },
};
