import { styled } from 'styled-components';

import bleedImage from './drop.png';
import dodgeImage from './body-balance.png';
import extraCardPlaysImage from './card-play.png';
import strengthImage from './biceps.png';

import { StatusEffects as StatusEffectsType, statusEffectNames } from '../../../game/gameState';
import { Row } from '../shared/Row';
import { maskImage } from '../../style';

const effectToImage: Record<keyof StatusEffectsType, string> = {
  bleed: bleedImage,
  dodge: dodgeImage,
  extraCardPlays: extraCardPlaysImage,
  strength: strengthImage,
};

const size = 1.7;

const StatusEffectValue = styled.div`
  font-size: ${size}rem;
  margin: 0 0.25rem;
`;

const Icon = styled.div<{ src: string }>`
  height: ${size}rem;
  width: ${size}rem;
  ${maskImage}
  display: inline-block;
  background-color: var(--color-secondary);
`;

const StatusEffectRow = styled(Row)`
  height: ${size}rem;
  justify-content: center;
  margin-bottom: 0.5rem;
`;

interface Props {
  statusEffects: StatusEffectsType;
}

export function StatusEffects({ statusEffects }: Props) {
  return (
    <StatusEffectRow>
      {statusEffectNames.map(
        (effectName, i) =>
          !!statusEffects[effectName] && (
            <StatusEffectValue key={i}>
              <Icon src={effectToImage[effectName]} />
              {statusEffects[effectName]}
            </StatusEffectValue>
          ),
      )}
    </StatusEffectRow>
  );
}
