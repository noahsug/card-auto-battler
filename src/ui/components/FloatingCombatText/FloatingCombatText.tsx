import { animated } from '@react-spring/web';
import { styled } from 'styled-components';

import { BattleEvent } from '../../../game/actions/battleEvent';
import { Z_INDEX } from '../../constants';
import {
  Props as AnimationProps,
  useFloatingCombatTextAnimation,
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
  font-family: ${(props) => (props.$type === 'miss' ? '' : 'var(--font-number)')};
  font-size: ${(props) => (props.$type === 'miss' ? 3 : 4)}rem;
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
