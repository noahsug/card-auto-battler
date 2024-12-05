import type { Meta, StoryObj } from '@storybook/react';
import last from 'lodash/last';

import { createGameState, StatusEffectType, statusEffectTypes } from '../../../game/gameState';
import { StatusEffects } from './StatusEffects';

const meta = {
  title: 'StatusEffects',
  component: StatusEffects,
} satisfies Meta<typeof StatusEffects>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Full: Story = {
  args: (() => {
    const player = createGameState().user;
    statusEffectTypes.forEach((statusEffectType: StatusEffectType, i) => {
      player[statusEffectType] = i + 1;
    });
    player[last(statusEffectTypes)!] = Infinity;
    return { player };
  })(),
};
