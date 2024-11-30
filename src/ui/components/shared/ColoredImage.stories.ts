import type { Meta, StoryObj } from '@storybook/react';

import featherImage from '../Card/feather.png';
import { ColoredImage } from './ColoredImage';

const meta = {
  title: 'ColoredImage',
  component: ColoredImage,
} satisfies Meta<typeof ColoredImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    src: featherImage,
    color: 'white',
    width: '50px',
    height: '50px',
  },
};
