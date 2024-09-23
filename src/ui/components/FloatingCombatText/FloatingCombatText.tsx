import { styled } from 'styled-components';
import { animated } from '@react-spring/web';

import { BattleEvent } from '../../../game/actions';
import {
  useFloatingCombatTextAnimation,
  Props as AnimationProps,
} from './useFloatingCombatTextAnimation';

export type Props = AnimationProps;

function getTextColor({ $type }: { $type: BattleEvent['type'] }) {
  switch ($type) {
    case 'damage':
      return 'darkred';
    case 'heal':
      return 'darkgreen';
    case 'miss':
      return 'yellow';
  }
  return $type satisfies never;
}

function getTextShadow({ $type }: { $type: BattleEvent['type'] }) {
  const color = $type === 'miss' ? 'black' : 'white';
  const size = 0.3;
  const offset = 0.1;
  return `
    ${offset}rem ${offset}rem ${size}rem ${color},
    ${offset}rem -${offset}rem ${size}rem ${color},
    -${offset}rem ${offset}rem ${size}rem ${color},
    -${offset}rem -${offset}rem ${size}rem ${color}
  `;
}

const Text = styled(animated.div)<{ $type: BattleEvent['type'] }>`
  position: absolute;
  color: ${getTextColor};
  font-size: ${(props) => (props.$type === 'miss' ? 3 : 4)}rem;
  font-weight: bold;
  text-shadow: ${getTextShadow};
  inset: 0;
  width: 0;
  height: 0;
`;

function getTextFromBattleEvent(battleEvent: BattleEvent) {
  switch (battleEvent.type) {
    case 'damage':
      return -battleEvent.value;
    case 'heal':
      return `+${battleEvent.value}`;
    case 'miss':
      return 'miss';
  }
  battleEvent satisfies never;
}

export function FloatingCombatText({ battleEvents, targetElement: target }: Props) {
  const render = useFloatingCombatTextAnimation({ battleEvents, targetElement: target });

  return render((style, { battleEvent }) => (
    <Text style={style} $type={battleEvent.type}>
      {getTextFromBattleEvent(battleEvent)}
    </Text>
  ));
}
