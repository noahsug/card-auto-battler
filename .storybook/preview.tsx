import type { Preview } from '@storybook/react';
import React from 'react';

import { GameStateProvider } from '../src/ui/components/GameStateContext';

import '../src/ui/index.css';

const preview: Preview = {
  decorators: [
    (Story, { parameters: { gameState } }) => (
      <GameStateProvider gameState={gameState}>
        <Story />
      </GameStateProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    backgrounds: {
      default: 'main',
      values: [
        {
          name: 'main',
          value: `url('/main-background.png')`,
        },
      ],
    },
  },
};

export default preview;
