import { useTransition } from '@react-spring/web';
import { useEffect, useMemo, useRef } from 'react';

import useUnits from '../../hooks/useUnits';
import { BattleEvent } from '../../../game/actions';

export interface Props {
  battleEvents: BattleEvent[];
  targetElement: Element | null;
}

type TextAnimation = ReturnType<typeof createTextAnimation>;

function createTextAnimation(battleEvent: BattleEvent) {
  return {
    battleEvent,
    xOffsetRatio: Math.random(),
    yOffsetRatio: Math.random(),
    key: crypto.randomUUID(),
  };
}

export function useFloatingCombatTextAnimation({ battleEvents, targetElement }: Props) {
  const [u] = useUnits();

  function getXY({ xOffsetRatio, yOffsetRatio }: { xOffsetRatio: number; yOffsetRatio: number }) {
    if (targetElement == null) return { x: 0, y: 0 };

    const { width, height } = targetElement.getBoundingClientRect();
    return { x: u(20) + (width - u(80)) * xOffsetRatio, y: (height / 2) * yOffsetRatio };
  }

  function getAnimationStart(textAnimation: TextAnimation) {
    return { ...getXY(textAnimation), opacity: 1 };
  }

  function getAnimationEnd(textAnimation: TextAnimation) {
    const { x, y: startY } = getXY(textAnimation);
    const y = startY + u(-10);
    return {
      x,
      y,
      opacity: 0,
      delay: 500,
      config: { duration: 500 },
    };
  }

  const textAnimationsRef = useRef<TextAnimation[]>([]);
  useMemo(() => {
    if (battleEvents.length === 0) {
      textAnimationsRef.current = [];
    } else {
      const newBattleEvents = battleEvents.slice(textAnimationsRef.current.length);
      textAnimationsRef.current.push(...newBattleEvents.map(createTextAnimation));
    }
  }, [battleEvents]);

  const [render, animationController] = useTransition(textAnimationsRef.current, () => ({
    key: ({ key }: TextAnimation) => key,
    from: getAnimationStart,
    enter: getAnimationEnd,
    leave: getAnimationEnd,
  }));

  useEffect(() => {
    animationController.start();
  }, [battleEvents]);

  return render;
}
