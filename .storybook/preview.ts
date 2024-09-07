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
      default: 'chalkboard',
      values: [
        {
          name: 'chalkboard',
          value: `url('/chalkboard-background.png')`,
        },
      ],
    },
  },
};

export default preview;
