import styled, { css } from 'styled-components';

import { CardEffects, CardState, StatusEffects } from '../gameState';
import CardTextItem from './CardTextItem';

interface Props {
  card: CardState;
  isActive?: boolean;
  scale?: number;
  className?: string;
  onClick?: () => void;
}

function getCardTextItems(effects: CardEffects | undefined, targetSelf: boolean) {
  if (!effects) {
    return [];
  }

  const cardTextItems = [];

  if (effects.damage != null) {
    cardTextItems.push(
      <CardTextItem effectName="damage" cardEffects={effects} targetSelf={targetSelf} />,
    );
  }

  if (effects.statusEffects) {
    Object.entries(effects.statusEffects).forEach(([statusEffectName, value]) => {
      cardTextItems.push(
        <CardTextItem
          statusEffectName={statusEffectName as keyof StatusEffects}
          cardEffects={effects}
          targetSelf={targetSelf}
        />,
      );
    });
  }

  return cardTextItems;
}

export default function Card({ card, isActive = false, scale = 1, className, onClick }: Props) {
  const cardTextItems = [
    ...getCardTextItems(card.target, false),
    ...getCardTextItems(card.self, true),
  ];

  return (
    <Root $isActive={isActive} $scale={scale} className={className} onClick={onClick}>
      {cardTextItems}
    </Root>
  );
}

const Root = styled.div<{ $scale: number; $isActive: boolean }>`
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
