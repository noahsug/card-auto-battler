import styled, { css } from 'styled-components';
import React from 'react';

import { CardEffects, CardState, statusEffectNames } from '../gameState';
import CardEffectText, {
  CardText,
  CARD_TEXT_SYMBOLS,
  CardEffectWithSymbols,
} from './CardEffectText';
import {
  GainEffectsOptions,
  Target,
  IdentifiablePlayerValue,
  IdentifiableBattleStats,
  Comparable,
  Conditional,
} from '../gameState/gameState';
import { joinText } from '../utils';

interface Props {
  card: CardState;
  isActive?: boolean;
  scale?: number;
  className?: string;
  onClick?: () => void;
}

const EFFECTS_DISPLAYED_FIRST = [
  'damage',
  'heal',
  'randomNegativeStatusEffects',
  'randomPositiveStatusEffects',
  'trash',
] as const;

function getGainEffectsTextParts({
  gainEffectsOptions,
  isRepeatingForEveryValue: isActivatingForEveryValue,
}: {
  gainEffectsOptions: GainEffectsOptions;
  isRepeatingForEveryValue: boolean;
}) {
  const {
    effects,
    // TODO: isMultiplicative = false,
    divisor = 1,
    forEveryPlayerValue,
    forEveryBattleStat,
  } = gainEffectsOptions;
  // we're activating once for each value, so only display "for every value"
  const skipEffectsText = isActivatingForEveryValue && effects.activations === 1;

  let effectText = '';
  if (!skipEffectsText) {
    const effectsTextBuilder: string[] = [];
    Object.entries(effects).forEach(([name, value]) => {
      const effectSymbol = CARD_TEXT_SYMBOLS[name as keyof typeof effects];

      // "3" damage or trash this card
      const valueText = value === true ? '' : value;

      // 2"❤️" or 2" bleed"
      // TODO: reuse CardEffectText logic
      const effectText =
        !valueText || effectSymbol.split(' ')[0].length <= 2 ? effectSymbol : ` ${effectSymbol}`;

      // "+"3 damage or 3 times for every value
      const prefix = getGainEffectPrefix(name, isActivatingForEveryValue);

      // "+X effect" for every value or "X times" for every value
      effectsTextBuilder.push(`${prefix}${valueText}${effectText}`);
    });
    effectText = effectsTextBuilder.join(', ');
  }

  const forEveryTextItems: string[] = [];
  if (forEveryPlayerValue) {
    const text = getForEveryText({ ...forEveryPlayerValue, divisor });
    forEveryTextItems.push(text);
  }
  if (forEveryBattleStat) {
    const text = getForEveryText({ ...forEveryBattleStat, divisor });
    forEveryTextItems.push(text);
  }
  const forEveryText = forEveryTextItems.join(' and ');

  const ifText = getConditionalText(gainEffectsOptions);

  const modifierText = joinText(forEveryText, ifText);
  return { effectText, modifierText };
}

function getGainEffectPrefix(name: string, isActivatingForEveryValue: boolean) {
  // X times for every value
  if (name === 'activations' && isActivatingForEveryValue) return '';
  // trash this card if value
  if (name === 'trashSelf') return '';
  // +X damage for every value
  return '+';
}

function getForEveryText({
  name,
  target,
  divisor,
}: {
  name: IdentifiablePlayerValue | IdentifiableBattleStats;
  target?: Target;
  divisor: number;
}) {
  const valueSymbol = CARD_TEXT_SYMBOLS[name];
  const divisorText = divisor === 1 ? '' : divisor;
  return `for every ${joinText(divisorText, target, valueSymbol)}`;
}

function getConditionalText(conditional: Conditional<unknown>) {
  const { ifPlayerValue, ifBattleStat } = conditional;

  const ifTextItems: string[] = [];
  if (ifPlayerValue) {
    const { name, target } = ifPlayerValue;
    const valueSymbol = CARD_TEXT_SYMBOLS[name];
    const value = `${target} ${valueSymbol}`;
    const text = getIfText({ comparable: ifPlayerValue, value });
    ifTextItems.push(text);
  }

  if (ifBattleStat) {
    const value = CARD_TEXT_SYMBOLS[ifBattleStat.name];
    const text = getIfText({ comparable: ifBattleStat, value });
    ifTextItems.push(text);
  }

  return ifTextItems.join(' and ');
}

function getIfText({ value, comparable }: { value: string; comparable: Comparable }) {
  const { comparison, compareToValue, compareToPlayerValue, compareToBattleStat, multiplier } =
    comparable;

  const multiplierText = multiplier ? ` ${getMultiplierText(multiplier)}` : '';

  const compareToTextParts = [];
  if (compareToValue) {
    compareToTextParts.push(compareToValue);
  }

  if (compareToPlayerValue) {
    const { target, name } = compareToPlayerValue;
    compareToTextParts.push(`${target} ${CARD_TEXT_SYMBOLS[name]}`);
  }

  if (compareToBattleStat) {
    const { name } = compareToBattleStat;
    compareToTextParts.push(CARD_TEXT_SYMBOLS[name]);
  }

  const compareToText = compareToTextParts.join(' and ');

  return `if ${value} ${comparison}${multiplierText} ${compareToText}`;
}

function getMultiplierText(multiplier: number) {
  // 50%
  if (multiplier <= 1) return `${Math.round(multiplier * 100)}%`;
  // 2x
  return `${multiplier}x`;
}

function getCardTextItems(effects: CardEffects, index: number) {
  const textItems: React.JSX.Element[] = [];

  function addEffectText(effectName: CardEffectWithSymbols, value?: number) {
    const key = `${effectName}-${index}`;
    textItems.push(<CardEffectText key={key} effectName={effectName} value={value} />);
  }

  // "X damage"
  EFFECTS_DISPLAYED_FIRST.forEach((effectName) => {
    const value = effects[effectName];
    if (value != null) {
      addEffectText(effectName, value);
    }
  });

  // "X statusEffect"
  statusEffectNames.forEach((effectName) => {
    const value = effects[effectName];
    if (value != null) {
      addEffectText(effectName, value);
    }
  });

  // "for every value"
  const isRepeatingForEveryValue =
    effects.activations === 0 &&
    !!effects.gainEffectsList?.some(({ effects }) => (effects.activations || 0) > 0);

  // "2x times"
  if (effects.activations != null && !isRepeatingForEveryValue) {
    addEffectText('activations', effects.activations);
  }

  const toSelfText = effects.target === 'self' ? 'to self' : '';

  const hasGainEffects = !!effects.gainEffectsList?.length;
  if (hasGainEffects) {
    effects.gainEffectsList?.forEach((gainEffectsOptions, gainIndex) => {
      // "+X effect to self for every value"
      const { effectText, modifierText } = getGainEffectsTextParts({
        gainEffectsOptions,
        isRepeatingForEveryValue,
      });
      const gainEffectsText = [effectText, toSelfText, modifierText].filter(Boolean).join(' ');
      textItems.push(
        <CardText key={`gainEffects-${index}-${gainIndex}`}>{gainEffectsText}</CardText>,
      );
    });
  } else {
    // "to self"
    if (toSelfText) {
      textItems.push(<CardText key={`self-${index}`}>{toSelfText}</CardText>);
    }
  }

  // trash self
  if (effects.trashSelf) {
    addEffectText('trashSelf');
  }

  const ifText = getConditionalText(effects);
  if (ifText) {
    textItems.push(<CardText key={`if-${index}`}>{ifText}</CardText>);
  }

  return textItems;
}

export default function Card({ card, isActive = false, scale = 1, className, onClick }: Props) {
  const textItemsBySection = card.effects.map(getCardTextItems);

  return (
    <Root $isActive={isActive} $scale={scale} className={className} onClick={onClick}>
      <div>
        {textItemsBySection.map((textItems, i) => (
          <CardTextSection key={i}>{textItems}</CardTextSection>
        ))}
      </div>
    </Root>
  );
}

const Root = styled.div<{ $scale: number; $isActive: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10rem;
  transition: transform 0.2s, box-shadow 0.2s;

  width: ${({ $scale }) => $scale * 192}rem;
  height: ${({ $scale }) => $scale * 256}rem;

  ${({ $isActive }) =>
    $isActive &&
    css`
      transform: scale(1.2);
      box-shadow: 7rem 7rem 10rem 0 rgba(0, 0, 0, 0.5);
    `}
`;

const CardTextSection = styled.div`
  & + & {
    margin-top: 10rem;
  }
`;
