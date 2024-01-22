import styled, { css } from 'styled-components';
import React from 'react';

import { CardEffects, CardState, statusEffectNames } from '../gameState';
import CardEffectText, { CardText } from './CardEffectText';

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

  if (effects.damage != null) {
    addEffectText('damage', effects.damage);
  }

  statusEffectNames.forEach((effectName) => {
    const value = effects[effectName];
    if (value != null) {
      addEffectText(effectName, value);
    }
  });

  if (effects.repeat != null) {
    addEffectText('repeat', effects.repeat);
  }

  if (effects.target === 'self') {
    textItems.push(<CardText key={`self-${index}`}>to self</CardText>);
  }

  return textItems;
}

export default function Card({ card, isActive = false, scale = 1, className, onClick }: Props) {
  const textItemsBySection = card.effects.map(getCardTextItems);

  if (card.trash) {
    textItemsBySection.push([<CardText key="trash">trash</CardText>]);
  }

  return (
    <Root $isActive={isActive} $scale={scale} className={className} onClick={onClick}>
      <div>
        {textItemsBySection.map((textItems) => (
          <CardTextSection>{textItems}</CardTextSection>
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
