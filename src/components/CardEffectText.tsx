import styled from 'styled-components';

import { CardEffects, StatusEffects } from '../gameState';
import { STATUS_EFFECT_SYMBOLS } from './StatusEffects';
import { assertIsNonNullable } from '../utils';

interface EffectIdentifier {
  effectName?: keyof Omit<CardEffects, 'statusEffects'>;
  statusEffectName?: keyof StatusEffects;
}

interface Props extends EffectIdentifier {
  value: number;
}

function getSymbol({ effectName, statusEffectName }: EffectIdentifier) {
  if (effectName === 'damage') {
    return '⚔️';
  }

  if (effectName === 'repeat') {
    return ' times';
  }

  assertIsNonNullable(statusEffectName);
  return STATUS_EFFECT_SYMBOLS[statusEffectName];
}

export default function CardEffectText({ effectName, statusEffectName, value }: Props) {
  const symbol = getSymbol({ effectName, statusEffectName });

  if (effectName === 'repeat') {
    // repeat 1 = hit two times
    value += 1;
  }

  return (
    <CardText>
      <CardTextNumber>{value}</CardTextNumber>
      {symbol}
    </CardText>
  );
}

const CardTextNumber = styled.span``;

export const CardText = styled.div`
  margin: 0 4rem;
  display: inline-block;
`;
