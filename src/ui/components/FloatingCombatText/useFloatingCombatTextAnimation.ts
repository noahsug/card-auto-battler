import { useSpringRef, useTransition } from '@react-spring/web';
import { useEffect, useMemo, useRef } from 'react';

import { useUnits } from '../../hooks/useUnits';
import { BattleEvent } from '../../../game/actions';
import { CARD_ANIMATION_DELAY } from '../CardStack/useCardStackAnimation';

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
  const animationController = useSpringRef();
  const textAnimationsRef = useRef<TextAnimation[]>([]);

  function getXY({ xOffsetRatio, yOffsetRatio }: { xOffsetRatio: number; yOffsetRatio: number }) {
    if (targetElement == null) return { x: 0, y: 0 };

    const { width, height } = targetElement.getBoundingClientRect();
    return { x: width * xOffsetRatio, y: (height / 2) * yOffsetRatio };
  }

  function getAnimationStart(textAnimation: TextAnimation) {
    return { ...getXY(textAnimation), opacity: 0 };
  }

  function animateCombatText(textAnimation: TextAnimation) {
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

  useMemo(() => {
    if (battleEvents.length === 0) {
      textAnimationsRef.current = [];
    } else {
      const newBattleEvents = battleEvents.slice(textAnimationsRef.current.length);
      textAnimationsRef.current.push(...newBattleEvents.map(createTextAnimation));
    }
  }, [battleEvents]);

  const render = useTransition(textAnimationsRef.current, {
    key: ({ key }: TextAnimation) => key,
    from: getAnimationStart,
    enter: animateCombatText,
    leave: getAnimationEnd,
    ref: animationController,
  });

  useEffect(() => {
    animationController.start();
  }, [animationController, textAnimationsRef.current.length]);

  return render;
}
