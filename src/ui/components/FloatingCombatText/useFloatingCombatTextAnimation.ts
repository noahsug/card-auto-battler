import { useSpringRef, useTransition } from '@react-spring/web';
import { useEffect, useMemo } from 'react';

import { BattleEvent } from '../../../game/actions/battleEvent';
import { useUnits } from '../../hooks/useUnits';
import { CARD_ANIMATION_DELAY } from '../CardStack/useCardStackAnimation';

export interface Props {
  battleEvents: BattleEvent[];
  targetElement: Element | null;
}

type AnimationData = ReturnType<typeof createTextAnimation>;

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
  const animationController = useSpringRef();
  const animations = useMemo(() => battleEvents.map(createTextAnimation), [battleEvents]);

  function getXY({ xOffsetRatio, yOffsetRatio }: { xOffsetRatio: number; yOffsetRatio: number }) {
    if (targetElement == null) return { x: 0, y: 0 };

    const { width, height } = targetElement.getBoundingClientRect();
    return { x: width * xOffsetRatio, y: (height / 2) * yOffsetRatio };
  }

  function getAnimationStart(textAnimation: AnimationData) {
    return { ...getXY(textAnimation), opacity: 0 };
  }

  function animateCombatText(textAnimation: AnimationData) {
    // delay the animation until the play is played
    const delay = textAnimation.battleEvent.source === 'card' ? CARD_ANIMATION_DELAY : 0;

    return async (next: (...args: unknown[]) => Promise<void>) => {
      await next({
        opacity: 1,
        immediate: true,
        delay,
      });
      await next(getAnimationEnd(textAnimation));
    };
  }

  function getAnimationEnd(textAnimation: AnimationData) {
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

  const render = useTransition(animations, {
    key: ({ key }: AnimationData) => key,
    from: getAnimationStart,
    enter: animateCombatText,
    leave: getAnimationEnd,
    ref: animationController,
  });

  useEffect(() => {
    animationController.start();
  }, [animationController, animations]);

  return render;
}
