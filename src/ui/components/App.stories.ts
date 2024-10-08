import type { Meta, StoryObj } from '@storybook/react';

import App from './App';
import { createGameState } from '../../game/gameState';

const meta = {
  title: 'App',
  component: App,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
