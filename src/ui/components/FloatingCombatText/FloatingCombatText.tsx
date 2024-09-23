import { styled } from 'styled-components';

import { BattleEvent } from '../../../game/actions';
import { animated } from '@react-spring/web';
import { useFloatingCombatTextAnimation, Props } from './useFloatingCombatTextAnimation';

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

const textShadowSize = 0.3;
const textShadowOffset = 0.1;

const Text = styled(animated.div)<{ $type: BattleEvent['type'] }>`
  position: absolute;
  color: ${getTextColor};
  font-size: 6rem;
  font-weight: bold;
  text-shadow:
    ${textShadowOffset}rem ${textShadowOffset}rem ${textShadowSize}rem white,
    ${textShadowOffset}rem -${textShadowOffset}rem ${textShadowSize}rem white,
    -${textShadowOffset}rem ${textShadowOffset}rem ${textShadowSize}rem white,
    -${textShadowOffset}rem -${textShadowOffset}rem ${textShadowSize}rem white;
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
