import { styled } from 'styled-components';
import { RefObject, useEffect } from 'react';
import { animated, useSpring, easings, to } from '@react-spring/web';
import clamp from 'lodash/clamp';

import { BattleEvent } from '../../game/actions';
import { useUnits, UnitFn } from '../hooks/useUnits';
import { Direction } from '../../utils/types';
import { CARD_ANIMATION_DELAY } from './CardStack/useCardStackAnimation';

function getDropShadow() {
  const dropShadow = 'drop-shadow(0 0 0.04rem var(--color-primary))';
  return new Array(4).fill(dropShadow).join(' ');
}

const ProfileImage = styled(animated.img)<{ $flip?: boolean }>`
  width: 12rem;
  margin-bottom: 0.5rem;
  filter: ${getDropShadow};
  transform: ${(props) => (props.$flip ? 'scaleX(-1)' : 'none')};
`;

interface Props {
  flip?: boolean;
  battleEvents: BattleEvent[];
  src: string;
  profileRef: RefObject<HTMLDivElement>;
}

const startPosition = { x: 0, y: 0, hue: 0, brightness: 1, config: { duration: 600 }, delay: 0 };

function summarizeBattleEvents(battleEvents: BattleEvent[]) {
  const summary = {
    damage: 0,
    misses: 0,
  };

  battleEvents.forEach((event) => {
    switch (event.type) {
      case 'miss':
        summary.misses += 1;
        break;
      case 'damage':
        summary.damage += event.value;
        break;
      case 'heal':
        summary.damage -= event.value;
        break;
    }
  });

  return summary;
}

function getDodgeAnimation({ u }: { u: UnitFn }) {
  return {
    x: u(25),
    y: u(20),
    hue: 0,
    delay: 0,
    config: { easing: easings.easeOutExpo, duration: 600 },
  };
}

function getHealAnimation({ u }: { u: UnitFn }) {
  return {
    x: 0,
    y: u(2),
    brightness: 2,
    delay: CARD_ANIMATION_DELAY,
    config: { easing: easings.easeOutCirc, duration: 200 },
  };
}

function getDamageAnimation({
  damage,
  direction,
  u,
}: {
  damage: number;
  direction: Direction;
  u: UnitFn;
}) {
  const magnitude = clamp(damage / 20, 0, 1);

  return {
    x: u(4 + 20 * magnitude) * direction,
    hue: 20 + 160 * magnitude,
    delay: CARD_ANIMATION_DELAY,
    config: { easing: easings.easeOutExpo, duration: 100 + 100 * magnitude },
  };
}

function getBattleAnimation({
  battleEvents,
  direction,
  u,
}: {
  battleEvents: BattleEvent[];
  direction: Direction;
  u: UnitFn;
}) {
  const { misses, damage } = summarizeBattleEvents(battleEvents);
  if (damage === 0 && misses === 0) return null;
  if (misses > 0 && damage <= 0) return getDodgeAnimation({ u });
  if (damage < 0) return getHealAnimation({ u });
  return getDamageAnimation({ damage, direction, u });
}

export function PlayerProfile({ flip, battleEvents, src, profileRef }: Props) {
  const [u] = useUnits();

  // move in the opposite direction the image is facing
  const direction = flip ? 1 : -1;

  const [animationProps, animationController] = useSpring(() => ({
    from: startPosition,
    onRest(_, ctrl) {
      ctrl.start(startPosition);
    },
  }));

  useEffect(() => {
    if (battleEvents.length > 0) {
      const battleAnimation = getBattleAnimation({ battleEvents, direction, u });
      if (battleAnimation) animationController.start(battleAnimation);
    } else {
      animationController.set(startPosition);
    }
  }, [animationController, battleEvents, direction, u]);

  const filter = to(
    [animationProps.hue, animationProps.brightness],
    (hue, brightness) => `hue-rotate(${hue}deg) brightness(${brightness})`,
  );

  return (
    <animated.div ref={profileRef} style={animationProps}>
      <ProfileImage $flip={flip} src={src} style={{ filter }} />
    </animated.div>
  );
}