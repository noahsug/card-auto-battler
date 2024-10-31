import { useSpringRef, useTransition } from '@react-spring/web';
import { useEffect, useMemo } from 'react';

import { BattleEvent } from '../../../game/actions/battleEvent';
import { UnitFn, useUnits } from '../../hooks/useUnits';
import { CARD_ANIMATION_DELAY } from '../CardStack/useCardStackAnimation2';

export interface Props {
  battleEvents: BattleEvent[];
  targetElement: Element | null;
}

interface AnimationContext {
  targetElement: Props['targetElement'];
  u: UnitFn;
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

function getXY({ xOffsetRatio, yOffsetRatio }: AnimationData, { targetElement }: AnimationContext) {
  if (targetElement == null) return { x: 0, y: 0 };

  const { width, height } = targetElement.getBoundingClientRect();
  return { x: width * xOffsetRatio, y: (height / 2) * yOffsetRatio };
}

function getAnimationStart(textAnimation: AnimationData, context: AnimationContext) {
  return { ...getXY(textAnimation, context), opacity: 0 };
}

function getAnimationEnd(textAnimation: AnimationData, context: AnimationContext) {
  const { u } = context;

  const { x, y: startY } = getXY(textAnimation, context);
  const y = startY + u(-10);
  return {
    x,
    y,
    opacity: 0,
    delay: 500,
    config: { duration: 500 },
  };
}

function animateCombatText(textAnimation: AnimationData, context: AnimationContext) {
  // delay the animation until the play is played
  const delay = textAnimation.battleEvent.source === 'card' ? CARD_ANIMATION_DELAY : 0;

  return async (next: (...args: unknown[]) => Promise<void>) => {
    await next({
      opacity: 1,
      immediate: true,
      delay,
    });
    await next(getAnimationEnd(textAnimation, context));
  };
}

export function useFloatingCombatTextAnimation({ battleEvents, targetElement }: Props) {
  const [u] = useUnits();
  const animationController = useSpringRef();
  const animations = useMemo(() => battleEvents.map(createTextAnimation), [battleEvents]);

  const context: AnimationContext = {
    targetElement,
    u,
  };

  const render = useTransition(animations, {
    key: ({ key }: AnimationData) => key,
    from: (textAnimation: AnimationData) => getAnimationStart(textAnimation, context),
    enter: (textAnimation: AnimationData) => animateCombatText(textAnimation, context),
    leave: (textAnimation: AnimationData) => getAnimationEnd(textAnimation, context),
    ref: animationController,
  });

  useEffect(() => {
    animationController.start();
  }, [animationController, animations]);

  return render;
}
