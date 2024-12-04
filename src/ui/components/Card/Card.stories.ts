import type { Meta, StoryObj } from '@storybook/react';
import sample from 'lodash/sample';

import { Card } from './Card';
import { allCards, cardsByType } from '../../../content/cards';

const meta = {
  title: 'Card',
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Punch: Story = {
  args: {
    size: 'large',
    card: cardsByType.attack,
  },
};
export const Channel: Story = {
  args: {
    size: 'large',
    card: cardsByType.channel,
  },
};

export const Chain: Story = {
  args: {
    size: 'large',
    card: { ...sample(allCards)!, chain: { fromId: 0 } },
  },
};

export const DoubleChain: Story = {
  args: {
    size: 'large',
    card: { ...sample(allCards)!, chain: { fromId: 0, toId: 1 } },
  },
};

export const Feather: Story = {
  args: {
    size: 'large',
    card: { ...sample(allCards)!, charm: 'feather' },
  },
};

export const FeatherChain: Story = {
  args: {
    size: 'large',
    card: { ...sample(allCards)!, chain: { toId: 0 }, charm: 'feather' },
  },
};
