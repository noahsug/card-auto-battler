import { styled } from 'styled-components';

import strengthImage from './biceps.png';
import dodgeImage from './body-balance.png';
import extraCardPlaysImage from './card-play.png';
import bleedImage from './drop.png';

import { StatusEffects as StatusEffectsType } from '../../../game/gameState';
import { maskImage } from '../../style';
import { Row } from '../shared/Row';

const effectToImage: Partial<Record<keyof StatusEffectsType, string>> = {
  bleed: bleedImage,
  dodge: dodgeImage,
  extraCardPlays: extraCardPlaysImage,
  strength: strengthImage,
};

const visibleStatusEffects = Object.keys(effectToImage) as (keyof StatusEffectsType)[];

const size = 1.7;

const StatusEffectValue = styled.div`
  font-size: ${size}rem;
`;

const Icon = styled.div<{ src: string }>`
  height: ${size}rem;
  width: ${size}rem;
  ${maskImage}
  display: inline-block;
  background-color: var(--color-primary-dark);
`;

const StatusEffectRow = styled(Row)`
  height: ${size}rem;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
`;

interface Props {
  statusEffects: StatusEffectsType;
}

export function StatusEffects({ statusEffects }: Props) {
  return (
    <StatusEffectRow>
      {visibleStatusEffects.map(
        (effectName, i) =>
          !!statusEffects[effectName] && (
            <StatusEffectValue key={i}>
              <Icon src={effectToImage[effectName]!} />
              {statusEffects[effectName]}
            </StatusEffectValue>
          ),
      )}
    </StatusEffectRow>
  );
}
