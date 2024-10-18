import type { Meta, StoryObj } from '@storybook/react';

import { EMPTY_STATUS_EFFECTS, StatusEffectName, statusEffectNames } from '../../../game/gameState';
import { StatusEffects } from './StatusEffects';

const meta = {
  title: 'StatusEffects',
  component: StatusEffects,
} satisfies Meta<typeof StatusEffects>;

export default meta;
type Story = StoryObj<typeof meta>;

const statusEffects = { ...EMPTY_STATUS_EFFECTS };
statusEffectNames.forEach((effectName: StatusEffectName, i) => {
  statusEffects[effectName] = i + 1;
});

export const Full: Story = {
  args: {
    statusEffects,
  },
};
