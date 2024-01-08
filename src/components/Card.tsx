import styled, { css } from 'styled-components';

import { CardEffects, CardState, StatusEffects } from '../gameState';
import CardEffectText, { CardText } from './CardEffectText';

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
    cardTextItems.push(<CardEffectText key="damage" effectName="damage" value={effects.damage} />);
  }

  const definedStatusEffects = effects.statusEffects
    ? Object.entries(effects.statusEffects).filter(([_, value]) => value != null)
    : [];

  definedStatusEffects.forEach(([statusEffectName, value]) => {
    cardTextItems.push(
      <CardEffectText
        key={`status-${statusEffectName}`}
        statusEffectName={statusEffectName as keyof StatusEffects}
        value={value!}
      />,
    );
  });

  if (effects.multihit != null) {
    cardTextItems.push(
      <CardEffectText key="multihit" effectName="multihit" value={effects.multihit} />,
    );
  }

  if (targetSelf) {
    cardTextItems.push(<CardText key="self">to self</CardText>);
  }

  return cardTextItems;
}

export default function Card({ card, isActive = false, scale = 1, className, onClick }: Props) {
  const targetTextItems = getCardTextItems(card.target, false);
  const selfTextItems = getCardTextItems(card.self, true);

  return (
    <Root $isActive={isActive} $scale={scale} className={className} onClick={onClick}>
      <CardTextSection>{targetTextItems}</CardTextSection>
      <CardTextSection>{selfTextItems}</CardTextSection>
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

const CardTextSection = styled.div`
  & + & {
    margin-top: 10rem;
  }
`;
