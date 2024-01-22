import styled from 'styled-components';

import { CardEffects } from '../gameState';
import { STATUS_EFFECT_SYMBOLS } from './StatusEffects';

interface Props {
  effectName: keyof CardEffects;
  value: number;
}

function getSymbol(effectName: keyof CardEffects) {
  if (effectName === 'damage') {
    return '⚔️';
  }

  if (effectName === 'repeat') {
    return ' times';
  }

  if (effectName in STATUS_EFFECT_SYMBOLS) {
    const statusEffectName = effectName as keyof typeof STATUS_EFFECT_SYMBOLS;
    return STATUS_EFFECT_SYMBOLS[statusEffectName];
  }

  throw new Error(`no symbol exists for effect ${effectName}`);
}

export default function CardEffectText({ effectName, value }: Props) {
  const symbol = getSymbol(effectName);

  if (effectName === 'repeat') {
    // repeat 1 = hit two times
    value += 1;
  }

  return (
    <CardText>
      <span>{value}</span>
      {symbol}
    </CardText>
  );
}

export const CardText = styled.div`
  margin: 0 4rem;
  display: inline-block;
`;
