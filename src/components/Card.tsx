import styled, { css } from 'styled-components';
import React from 'react';

import { CardEffects, CardState, statusEffectNames } from '../gameState';
import CardEffectText, {
  CardText,
  CARD_TEXT_SYMBOLS,
  CardEffectsWithSymbols,
} from './CardEffectText';
import { GainEffectsOptions } from '../gameState/gameState';

interface Props {
  card: CardState;
  isActive?: boolean;
  scale?: number;
  className?: string;
  onClick?: () => void;
}

function getGainEffectsText({
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
  } = gainEffectsOptions;

  const textParts = [];

  // TODO: implement gaining trashSelf
  const { trashSelf, ...numericEffects } = effects;

  // we're activating once for each value, so only display "for every value"
  const skipEffectsText = isActivatingForEveryValue && effects.activations === 1;

  if (!skipEffectsText) {
    const effectsTextBuilder: string[] = [];
    Object.entries(numericEffects).forEach(([name, value]) => {
      const effectSymbol = CARD_TEXT_SYMBOLS[name as keyof typeof numericEffects];

      // "+X effect" for every value or "X times" for every value
      const prefix = name === 'activations' && isActivatingForEveryValue ? '' : '+';
      effectsTextBuilder.push(`${prefix}${value}${effectSymbol}`);
    });
    textParts.push(effectsTextBuilder.join(', '));
  }

  if (forEveryPlayerValue) {
    const { target, name } = forEveryPlayerValue;
    const playerValueSymbol = CARD_TEXT_SYMBOLS[name];
    const divisorText = divisor === 1 ? '' : `${divisor} `;
    textParts.push(`for every ${divisorText}${target} ${playerValueSymbol}`);
  }

  return textParts.filter(Boolean).join(' ');
}

function getCardTextItems(effects: CardEffects, index: number) {
  const textItems: React.JSX.Element[] = [];

  function addEffectText(effectName: keyof CardEffectsWithSymbols, value: number) {
    const key = `${effectName}-${index}`;
    textItems.push(<CardEffectText key={key} effectName={effectName} value={value} />);
  }

  // "X damage"
  if (effects.damage != null) {
    addEffectText('damage', effects.damage);
  }

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

  effects.gainEffectsList?.forEach((gainEffectsOptions, gainIndex) => {
    // "+X effect for every value"
    const gainEffectsText = getGainEffectsText({ gainEffectsOptions, isRepeatingForEveryValue });
    textItems.push(
      <CardText key={`gainEffects-${index}-${gainIndex}`}>{gainEffectsText}</CardText>,
    );
  });

  // "to self"
  if (effects.target === 'self') {
    textItems.push(<CardText key={`self-${index}`}>to self</CardText>);
  }

  return textItems;
}

export default function Card({ card, isActive = false, scale = 1, className, onClick }: Props) {
  const textItemsBySection = card.effects.map(getCardTextItems);

  // "trash"
  if (card.effects.some(({ trashSelf }) => trashSelf)) {
    textItemsBySection.push([<CardText key="trash">trash</CardText>]);
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
