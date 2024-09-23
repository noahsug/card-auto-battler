import type { Meta, StoryObj } from '@storybook/react';

import { styled } from 'styled-components';
import { BattleEvent } from '../../../game/actions';
import { useRef } from 'react';
import { FloatingCombatText, Props } from './FloatingCombatText';

const meta = {
  title: 'FloatingCombatText',
  component: FloatingCombatText,
} satisfies Meta<typeof FloatingCombatText>;

export default meta;
type Story = StoryObj<typeof meta>;

const Container = styled.div`
  width: 100px;
  height: 100px;
  position: relative;
`;

function TargetWithFloatingCombatText(props: Omit<Props, 'target'>) {
  const targetRef = useRef(null);
  return (
    <>
      <Container>
        <FloatingCombatText {...props} targetElement={targetRef.current} />
      </Container>
    </>
  );
}

function getStory(battleEvents: BattleEvent[]): Story {
  return {
    args: {
      battleEvents,
      targetElement: null,
    },
    render: ({ battleEvents }) => <TargetWithFloatingCombatText battleEvents={battleEvents} />,
  };
}

export const Damage = getStory([{ type: 'damage', value: 10, target: 'self' }]);

export const MultiHitDamage = getStory([
  { type: 'damage', value: 10, target: 'self' },
  { type: 'damage', value: 10, target: 'self' },
  { type: 'damage', value: 10, target: 'self' },
]);

export const Miss = getStory([{ type: 'miss', target: 'self' }]);
