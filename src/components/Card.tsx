import styled, { css } from 'styled-components';
import React from 'react';

import { CardEffects, CardState, statusEffectNames } from '../gameState';
import CardEffectText, { CardText, getSymbol } from './CardEffectText';

interface Props {
  card: CardState;
  isActive?: boolean;
  scale?: number;
  className?: string;
  onClick?: () => void;
}

function getCardTextItems(effects: CardEffects, index: number) {
  const textItems: React.JSX.Element[] = [];

  function addEffectText(effectName: keyof CardEffects, value: number) {
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

  // "for each playerValue"
  const isRepeatingForEachPlayerValue =
    effects.repeat === -1 && effects.effectBasedOnPlayerValue?.effectName === 'repeat';

  // "2x times"
  if (effects.repeat != null && !isRepeatingForEachPlayerValue) {
    addEffectText('repeat', effects.repeat);
  }

  // "+X effect for each playerValue"
  if (effects.effectBasedOnPlayerValue != null) {
    const {
      effectName,
      basedOn: { target, valueName },
      ratio = 1,
    } = effects.effectBasedOnPlayerValue;

    const effectSymbol = getSymbol(effectName);
    let effectText = `+${ratio}${effectSymbol} `;

    if (isRepeatingForEachPlayerValue && ratio === 1) {
      // for each playerValue
      effectText = '';
    }

    // TODO: handle ratios > 0 & < 1, e.g. "1 damage for every 2 opponent bleed"
    const basedOnValueSymbol = getSymbol(valueName);
    const forEachText = `for each ${target} ${basedOnValueSymbol}`;

    textItems.push(
      <CardText key={`effectBasedOnPlayerValue-${index}`}>
        {effectText}
        {forEachText}
      </CardText>,
    );
  }

  // "to self"
  if (effects.target === 'self') {
    textItems.push(<CardText key={`self-${index}`}>to self</CardText>);
  }

  return textItems;
}

export default function Card({ card, isActive = false, scale = 1, className, onClick }: Props) {
  const textItemsBySection = card.effects.map(getCardTextItems);

  // "trash"
  if (card.trash) {
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
  transition:
    transform 0.2s,
    box-shadow 0.2s;

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
