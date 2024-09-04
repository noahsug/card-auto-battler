import { css, styled } from 'styled-components';
import React from 'react';

import { CardState } from '../../gameState';
import { CardText } from '../CardEffectText';

import getCardText from './getCardText';

interface Props {
  card: CardState;
  isActive?: boolean;
  scale?: number;
  className?: string;
  onClick?: () => void;
}

function getReadableCardName(name: string) {
  return name.replace(/Card$/, '');
}

export default function Card({ card, isActive = false, scale = 1, className, onClick }: Props) {
  const cardTextLines = getCardText(card);
  const cardName = getReadableCardName(card.name);

  return (
    <Root $isActive={isActive} $scale={scale} className={className} onClick={onClick}>
      <CardName>{cardName}</CardName>
      <div>
        {cardTextLines.map((text, i) => (
          <CardTextSection key={i}>
            <CardText>{text}.</CardText>
          </CardTextSection>
        ))}
      </div>
    </Root>
  );
}

const Root = styled.div<{ $scale: number; $isActive: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10rem;
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  width: ${({ $scale }) => $scale * 192}rem;
  height: ${({ $scale }) => $scale * 256}rem;
  font-size: ${({ $scale }) => $scale * 26}rem;

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

const CardName = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  font-size: 10rem;
  font-weight: bold;
  margin-bottom: 10rem;
`;
