import styled from 'styled-components';

import { CardEffects, StatusEffects } from '../gameState';
import { STATUS_EFFECT_SYMBOLS } from './StatusEffects';
import { assertIsDefined } from '../utils';

interface EffectIdentifier {
  effectName?: keyof Omit<CardEffects, 'statusEffects'>;
  statusEffectName?: keyof StatusEffects;
}

interface Props extends EffectIdentifier {
  targetSelf: boolean;
  cardEffects: CardEffects;
}

function getValue(cardEffects: CardEffects, { effectName, statusEffectName }: EffectIdentifier) {
  if (statusEffectName != null) {
    assertIsDefined(cardEffects.statusEffects);
    return cardEffects.statusEffects[statusEffectName];
  }

  assertIsDefined(effectName);
  const value = cardEffects[effectName];
  assertIsDefined(value);
  return value;
}

function getSymbol({ effectName, statusEffectName }: EffectIdentifier) {
  if (effectName === 'damage') {
    return '⚔️';
  }
  if (statusEffectName != null) {
    return STATUS_EFFECT_SYMBOLS[statusEffectName];
  }
  throw new Error(`no symbol exists for effect ${effectName}`);
}

export default function CardTextItem({
  effectName,
  statusEffectName,
  cardEffects,
  targetSelf,
}: Props) {
  const symbol = getSymbol({ effectName, statusEffectName });
  const value = getValue(cardEffects, { effectName, statusEffectName });
  const selfText = targetSelf ? 'to self.' : '';
  return (
    <Root key={effectName || statusEffectName}>
      <CardTextNumber>{value}</CardTextNumber>
      {symbol}
      {selfText}
    </Root>
  );
}

const CardTextNumber = styled.span``;

const Root = styled.div`
  margin: 0 4rem;
  display: inline-block;
`;
