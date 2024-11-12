import { styled } from 'styled-components';

import strengthImage from './images/biceps.png';
import dodgeImage from './images/body-balance.png';
import extraCardPlaysImage from './images/card-play.png';
import bleedImage from './images/drop.png';
import regenImage from './images/falling-leaf.png';
import channelImage from './images/fire-silhouette.png';

import { StatusEffects as StatusEffectsType } from '../../../game/gameState';
import { maskImage } from '../../style';
import { Row } from '../shared/Row';
import { Number } from '../shared/Number';

const effectToImage: Record<keyof StatusEffectsType, string> = {
  bleed: bleedImage,
  dodge: dodgeImage,
  extraCardPlays: extraCardPlaysImage,
  strength: strengthImage,
  regen: regenImage,
  channel: channelImage,
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
              <Number>{statusEffects[effectName]}</Number>
            </StatusEffectValue>
          ),
      )}
    </StatusEffectRow>
  );
}
