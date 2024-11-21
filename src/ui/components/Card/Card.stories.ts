import type { Meta, StoryObj } from '@storybook/react';

import { Card } from './Card';
import { cardsByName } from '../../../content/cards';

const meta = {
  title: 'Card',
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Punch: Story = {
  args: {
    size: 'large',
    card: cardsByName.attack,
  },
};
export const Fireball: Story = {
  args: {
    size: 'large',
    card: cardsByName.fireball,
  },
};
export const Eviscerate: Story = {
  args: {
    size: 'large',
    card: cardsByName.eviscerate,
  },
};
export const Channel: Story = {
  args: {
    size: 'large',
    card: cardsByName.channel,
  },
};

export const Chain: Story = {
  args: {
    size: 'large',
    card: { ...cardsByName.channel, chain: { fromId: 0 } },
  },
};

export const DoubleChain: Story = {
  args: {
    size: 'large',
    card: { ...cardsByName.attack, chain: { fromId: 0, toId: 1 } },
  },
};
