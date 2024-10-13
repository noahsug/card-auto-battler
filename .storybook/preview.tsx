import type { Preview } from '@storybook/react';
import React from 'react';

import { GameStateProvider } from '../src/ui/components/GameStateContext';
import '../src/ui/index.css';

const viewports = {
  pixel8: {
    name: 'Pixel 8',
    styles: {
      width: '412px',
      height: '915px',
    },
  },
  pixel1: {
    name: 'Pixel 1',
    styles: {
      width: '412px',
      height: '732px',
    },
  },
};

const preview: Preview = {
  decorators: [
    (Story, { parameters: { gameState } }) => (
      <GameStateProvider gameState={gameState}>
        <Story />
      </GameStateProvider>
    ),
  ],
  parameters: {
    viewport: {
      viewports,
    },
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
