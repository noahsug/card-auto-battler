import type { Meta, StoryObj } from '@storybook/react';

import { BattleEvent } from '../../../game/actions/battleEvent';
import { FloatingCombatText } from './FloatingCombatText';

const meta = {
  title: 'FloatingCombatText',
  component: FloatingCombatText,
} satisfies Meta<typeof FloatingCombatText>;

export default meta;
type Story = StoryObj<typeof meta>;

function getStory(battleEvents: BattleEvent[]): Story {
  return {
    args: {
      battleEvents,
      targetBoundingRect: new DOMRect(200, 200, 200, 200),
    },
  };
}

export const Damage = getStory([{ type: 'damage', value: 10, target: 'self' }]);

export const MultiHitDamage = getStory([
  { type: 'damage', value: 10, target: 'self' },
  { type: 'damage', value: 10, target: 'self' },
  { type: 'damage', value: 10, target: 'self' },
]);

export const Miss = getStory([{ type: 'miss', target: 'self' }]);

export const Heal = getStory([{ type: 'heal', target: 'self', value: 3 }]);
