import { animated, easings, to, useSpring } from '@react-spring/web';
import clamp from 'lodash/clamp';
import { useEffect } from 'react';
import { styled } from 'styled-components';

import { BattleEvent } from '../../game/actions/battleEvent';
import { Direction } from '../../utils/types';
import { UnitFn, useUnits } from '../hooks/useUnits';
import { ControllerUpdate } from '../utils/reactSpring';
import { Image } from './shared/Image';

const oneDropShadowGlow = 'drop-shadow(0 0 0.04rem var(--color-primary))';
const dropShadowGlow = new Array(4).fill(oneDropShadowGlow).join(' ');

const AnimatedContainer = styled(animated.div)`
  filter: ${dropShadowGlow};
`;

const size = 12;

const ProfileImage = styled(animated(Image))<{ $flip?: boolean }>`
  width: ${size}rem;
  height: ${size}rem;
  margin-bottom: 0.5rem;
  transform: ${(props) => (props.$flip ? 'scaleX(-1)' : 'none')};
`;

interface Props {
  flip?: boolean;
  battleEvents: BattleEvent[];
  src: string;
  handleRef: (element: Element | null) => void;
  isDead?: boolean;
}

const startPosition = {
  x: 0,
  y: 0,
  hue: 0,
  brightness: 1,
  rotate: 0,
  config: { duration: 600 },
  delay: 0,
};

type AnimationOptions = ControllerUpdate<typeof startPosition>;

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
  } satisfies AnimationOptions;
}

function getHealAnimation({ u }: { u: UnitFn }) {
  return {
    x: 0,
    y: u(2),
    brightness: 2,
    config: { easing: easings.easeOutCirc, duration: 200 },
  } satisfies AnimationOptions;
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
    config: { easing: easings.easeOutExpo, duration: 100 + 100 * magnitude },
  } satisfies AnimationOptions;
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
  if (damage === 0 && misses === 0) return startPosition;
  if (misses > 0 && damage <= 0) return getDodgeAnimation({ u });
  if (damage < 0) return getHealAnimation({ u });
  return getDamageAnimation({ damage, direction, u });
}

function getDeathAnimation({
  u,
  direction,
  windowWidth,
}: {
  u: UnitFn;
  direction: Direction;
  windowWidth: number;
}): AnimationOptions {
  return {
    x: (windowWidth / 2) * direction,
    y: u(-100),
    hue: 180,
    rotate: 360 * direction,
    config: { easing: easings.easeOutCubic, duration: 5000 },
  };
}

export function PlayerProfile({ flip, battleEvents, src, handleRef, isDead }: Props) {
  const [u, windowDimensions] = useUnits();

  // recoil in the opposite direction the image is facing
  const direction = flip ? 1 : -1;

  const [animationProps, animationController] = useSpring(
    () => ({
      from: startPosition,
      onRest(_, ctrl) {
        if (isDead) return;
        ctrl.start(startPosition);
      },
    }),
    [isDead],
  );

  // animate battle events
  useEffect(() => {
    const animation = isDead
      ? getDeathAnimation({ u, direction, windowWidth: windowDimensions.width })
      : getBattleAnimation({ battleEvents, direction, u });
    animationController.start(animation);
  }, [animationController, battleEvents, direction, isDead, u, windowDimensions.width]);

  const filter = to(
    [animationProps.hue, animationProps.brightness],
    (hue, brightness) => `hue-rotate(${hue}deg) brightness(${brightness})`,
  );

  return (
    <div ref={handleRef}>
      <AnimatedContainer style={animationProps}>
        <ProfileImage $flip={flip} src={src} style={{ filter }} />
      </AnimatedContainer>
    </div>
  );
}
