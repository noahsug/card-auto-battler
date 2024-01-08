import styled from 'styled-components';
import { StatusEffects as StatusEffectsState } from '../gameState/gameState';
import { Entries } from '../utils/types/types';

interface Props {
  statusEffects: StatusEffectsState;
}

export const STATUS_EFFECT_SYMBOLS: { [K in keyof StatusEffectsState]: string } = {
  bleed: '🩸',
  extraCardPlays: '🃏',
};

export default function StatusEffects({ statusEffects }: Props) {
  const effectMessages = (Object.entries(statusEffects) as Entries<StatusEffectsState>)
    .map(([name, value]) => {
      return (
        value && (
          <Effect key={name}>
            {STATUS_EFFECT_SYMBOLS[name]}
            {value}
          </Effect>
        )
      );
    })
    .filter(Boolean);
  return <Root>{effectMessages}</Root>;
}

const Root = styled.div`
  margin: 10rem 0;
  font-size: 15rem;
  height: 15rem;
`;

const Effect = styled.span`
  margin: 5rem;
`;
