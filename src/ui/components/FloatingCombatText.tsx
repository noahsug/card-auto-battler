import { styled } from 'styled-components';

import { BattleEvent } from '../../game/actions';
import { animated, useTransition, easings } from '@react-spring/web';
import { useEffect, useMemo, useRef } from 'react';
import useUnits from '../hooks/useUnits';

export interface Props {
  battleEvents: BattleEvent[];
  target: Element | null;
}

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

type TextAnimation = ReturnType<typeof createTextAnimation>;

function createTextAnimation(battleEvent: BattleEvent) {
  return {
    battleEvent,
    xOffsetRatio: Math.random(),
    yOffsetRatio: Math.random(),
    key: crypto.randomUUID(),
  };
}

function getXY(
  target: Props['target'],
  { xOffsetRatio, yOffsetRatio }: { xOffsetRatio: number; yOffsetRatio: number },
  u: (value: number) => number,
) {
  if (target == null) return { x: 0, y: 0 };

  const { width, height } = target.getBoundingClientRect();
  return { x: u(20) + (width - u(80)) * xOffsetRatio, y: (height / 2) * yOffsetRatio };
}

function getAnimationStart(
  target: Element | null,
  textAnimation: TextAnimation,
  u: (value: number) => number,
) {
  return { ...getXY(target, textAnimation, u), opacity: 1 };
}

function getAnimationEnd(
  target: Props['target'],
  textAnimation: TextAnimation,
  u: (value: number) => number,
) {
  const { x, y: startY } = getXY(target, textAnimation, u);
  const y = startY + u(-10);
  return {
    x,
    y,
    opacity: 0,
    delay: 500,
    config: { duration: 500 },
  };
}

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

export default function FloatingCombatText({ battleEvents, target }: Props) {
  const textAnimationsRef = useRef<TextAnimation[]>([]);
  useMemo(() => {
    console.log(target, battleEvents);
    if (battleEvents.length === 0) {
      textAnimationsRef.current = [];
    } else {
      const newBattleEvents = battleEvents.slice(textAnimationsRef.current.length);
      textAnimationsRef.current.push(...newBattleEvents.map(createTextAnimation));
      console.log(target, battleEvents, textAnimationsRef.current);
    }
  }, [battleEvents]);

  const [u] = useUnits();

  const [render, animationController] = useTransition(textAnimationsRef.current, () => ({
    key: ({ key }: TextAnimation) => key,
    from: (textAnimation) => getAnimationStart(target, textAnimation, u),
    enter: (textAnimation) => getAnimationEnd(target, textAnimation, u),
    leave: (textAnimation) => getAnimationEnd(target, textAnimation, u),
  }));

  useEffect(() => {
    animationController.start();
  }, [battleEvents]);

  return render((style, { battleEvent }) => (
    <Text style={style} $type={battleEvent.type}>
      {getTextFromBattleEvent(battleEvent)}
    </Text>
  ));
}
