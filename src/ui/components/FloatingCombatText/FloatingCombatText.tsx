import { animated } from '@react-spring/web';
import { styled } from 'styled-components';

import { BattleEvent, ValueBattleEvent } from '../../../game/actions/battleEvent';
import { Z_INDEX } from '../../constants';
import {
  Props as AnimationProps,
  useFloatingCombatTextAnimation,
} from './useFloatingCombatTextAnimation';
import { useMemo } from 'react';

export type Props = AnimationProps;

const battleEventsTypesWithFCT = new Set(['damage', 'heal', 'miss']);

function getTextColor({ $battleEvent }: { $battleEvent: BattleEvent }) {
  switch ($battleEvent.type) {
    case 'damage':
      return $battleEvent.isCrit ? 'hsl(50, 85%, 50%)' : 'hsl(0, 85%, 20%)';
    case 'heal':
      return $battleEvent.isCrit ? 'hsl(80, 85%, 50%)' : 'hsl(120, 85%, 20%)';
    case 'miss':
      return 'yellow';
  }
}

function getTextShadow({ $battleEvent }: { $battleEvent: BattleEvent }) {
  const isCrit = ($battleEvent as ValueBattleEvent).isCrit;
  const color = $battleEvent.type === 'miss' || isCrit ? 'var(--color-bg)' : 'var(--color-primary)';
  const size = 0.1;
  const offset = 0.1;
  return `
    ${offset}rem ${offset}rem ${size}rem ${color},
    ${offset}rem -${offset}rem ${size}rem ${color},
    -${offset}rem ${offset}rem ${size}rem ${color},
    -${offset}rem -${offset}rem ${size}rem ${color}
  `;
}

function getFontFamily({ $battleEvent }: { $battleEvent: BattleEvent }) {
  return $battleEvent.type === 'miss' ? '' : 'var(--font-number)';
}

function getFontSize({ $battleEvent }: { $battleEvent: BattleEvent }) {
  if ($battleEvent.type === 'miss') return 3;
  if (($battleEvent as ValueBattleEvent).isCrit) return 4.35;
  return 4;
}

const Text = styled(animated.div)<{ $battleEvent: BattleEvent }>`
  position: absolute;
  color: ${getTextColor};
  font-family: ${getFontFamily};
  font-size: ${getFontSize}rem;
  font-weight: bold;
  text-shadow: ${getTextShadow};
  inset: 0;
  width: 0;
  height: 0;
  z-index: ${Z_INDEX.floatingCombatText};
`;

function getTextFromBattleEvent(battleEvent: BattleEvent) {
  switch (battleEvent.type) {
    case 'damage':
      return battleEvent.value;
    case 'heal':
      return `${battleEvent.value}`;
    case 'miss':
      return 'miss';
  }
}

export function FloatingCombatText({ battleEvents, targetBoundingRect }: Props) {
  const battleEventsWithFCT = useMemo(
    () => battleEvents.filter((event) => battleEventsTypesWithFCT.has(event.type)),
    [battleEvents],
  );
  const render = useFloatingCombatTextAnimation({
    battleEvents: battleEventsWithFCT,
    targetBoundingRect,
  });

  return render((style, { battleEvent }) => (
    <Text style={style} $battleEvent={battleEvent}>
      {getTextFromBattleEvent(battleEvent)}
    </Text>
  ));
}
