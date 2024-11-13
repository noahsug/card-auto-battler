import type { Meta, StoryObj } from '@storybook/react';

import { createGameState, StatusEffectName, statusEffectNames } from '../../../game/gameState';
import { StatusEffects } from './StatusEffects';

const meta = {
  title: 'StatusEffects',
  component: StatusEffects,
} satisfies Meta<typeof StatusEffects>;

export default meta;
type Story = StoryObj<typeof meta>;

const player = createGameState().user;
statusEffectNames.forEach((effectName: StatusEffectName, i) => {
  player[effectName] = i + 1;
});

export const Full: Story = {
  args: {
    player,
  },
};
