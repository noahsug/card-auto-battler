import type { Preview } from '@storybook/react';

import '../src/ui/index.css';

const preview: Preview = {
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
