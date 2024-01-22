import styled from 'styled-components';
import React from 'react';

import { StatusEffects as StatusEffectsState } from '../gameState';
import { StatusEffectName, statusEffectNames } from '../gameState/gameState';

interface Props {
  statusEffects: StatusEffectsState;
}

export const STATUS_EFFECT_SYMBOLS: Record<StatusEffectName, string> = {
  bleed: '🩸',
  extraCardPlays: '🃏',
  dodge: '💨',
  strength: '💪',
};

export default function StatusEffects({ statusEffects }: Props) {
  const effectMessages: React.JSX.Element[] = [];

  statusEffectNames.forEach((effectName) => {
    const value = statusEffects[effectName];
    if (value === 0) return;

    effectMessages.push(
      <Effect key={effectName}>
        {STATUS_EFFECT_SYMBOLS[effectName]}
        {value}
      </Effect>,
    );
  });

  return <Root>{effectMessages}</Root>;
}

const Root = styled.div`
  margin: 10rem 0;
  font-size: 15rem;
  height: 15rem;
`;

const Effect = styled.span`
  margin: 5rem;
`;
