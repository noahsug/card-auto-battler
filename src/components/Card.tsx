import styled, { css } from 'styled-components';
import React from 'react';

import { CardEffects, CardState, statusEffectNames } from '../gameState';
import CardEffectText, {
  CardText,
  CARD_TEXT_SYMBOLS,
  CardEffectWithSymbols,
} from './CardEffectText';
import { GainEffectsOptions } from '../gameState/gameState';

interface Props {
  card: CardState;
  isActive?: boolean;
  scale?: number;
  className?: string;
  onClick?: () => void;
}

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

  let effectText = '';

  // we're activating once for each value, so only display "for every value"
  const skipEffectsText = isActivatingForEveryValue && effects.activations === 1;

  if (!skipEffectsText) {
    const effectsTextBuilder: string[] = [];
    Object.entries(effects).forEach(([name, value]) => {
      const effectSymbol = CARD_TEXT_SYMBOLS[name as keyof typeof effects];

      // "+X effect" for every value or "X times" for every value
      const prefix = name === 'activations' && isActivatingForEveryValue ? '' : '+';
      effectsTextBuilder.push(`${prefix}${value}${effectSymbol}`);
    });
    effectText = effectsTextBuilder.join(', ');
  }

  let forEveryText = '';

  if (forEveryPlayerValue) {
    const { target, name } = forEveryPlayerValue;
    const playerValueSymbol = CARD_TEXT_SYMBOLS[name];
    const divisorText = divisor === 1 ? '' : `${divisor} `;
    forEveryText = `for every ${divisorText}${target} ${playerValueSymbol}`;
  }

  if (forEveryBattleStat) {
    const { name } = forEveryBattleStat;
    const battleStatSymbol = CARD_TEXT_SYMBOLS[name];
    const divisorText = divisor === 1 ? '' : `${divisor} `;
    forEveryText = `for every ${divisorText}${battleStatSymbol}`;
  }

  return { effectText, forEveryText };
}

function getCardTextItems(effects: CardEffects, index: number) {
  const textItems: React.JSX.Element[] = [];

  function addEffectText(effectName: CardEffectWithSymbols, value: number) {
    const key = `${effectName}-${index}`;
    textItems.push(<CardEffectText key={key} effectName={effectName} value={value} />);
  }

  // "X damage"
  // TODO: share this list with CardEffectText as numericEffects
  const simpleEffects = [
    'damage',
    'heal',
    'trash',
    'randomNegativeStatusEffects',
    'randomPositiveStatusEffects',
  ] as const;
  simpleEffects.forEach((effectName) => {
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
      const { effectText, forEveryText } = getGainEffectsTextParts({
        gainEffectsOptions,
        isRepeatingForEveryValue,
      });
      const gainEffectsText = [effectText, toSelfText, forEveryText].filter(Boolean).join(' ');
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

  return textItems;
}

export default function Card({ card, isActive = false, scale = 1, className, onClick }: Props) {
  const textItemsBySection = card.effects.map(getCardTextItems);

  // "trash self"
  if (card.effects.some(({ trashSelf }) => trashSelf)) {
    textItemsBySection.push([<CardText key="trash">{CARD_TEXT_SYMBOLS.trashSelf}</CardText>]);
  }

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
