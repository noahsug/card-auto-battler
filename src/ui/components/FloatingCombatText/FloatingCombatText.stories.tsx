import type { Meta, StoryObj } from '@storybook/react';

import { BattleEvent, createBattleEvent } from '../../../game/actions/battleEvent';
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

export const Damage = getStory([createBattleEvent('damage', 10, 'opponent')]);

export const ZeroDamage = getStory([createBattleEvent('damage', 0, 'opponent')]);

export const DamageCrit = getStory([createBattleEvent('damage', 10, 'opponent', 'other', true)]);

export const MultiHitDamage = getStory([
  createBattleEvent('damage', 10, 'opponent'),
  createBattleEvent('damage', 10, 'opponent'),
  createBattleEvent('damage', 10, 'opponent'),
]);

export const Miss = getStory([createBattleEvent('miss', 'opponent')]);

export const Heal = getStory([createBattleEvent('heal', 10, 'self')]);

export const HealCrit = getStory([createBattleEvent('heal', 10, 'self', 'other', true)]);
