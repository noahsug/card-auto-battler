import styled from 'styled-components';
import { Effects } from '../gameState/gameState';
import { Entries } from '../utils/types/types';

interface Props {
  effects: Effects;
}

const EFFECT_SYMBOLS: { [K in keyof Effects]: string } = {
  bleed: '🩸',
  extraCardPlays: '🃏',
};

export default function StatusEffects({ effects }: Props) {
  const effectMessages = (Object.entries(effects) as Entries<Effects>)
    .map(([name, value]) => {
      return (
        value && (
          <Effect key={name}>
            {EFFECT_SYMBOLS[name]}
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
