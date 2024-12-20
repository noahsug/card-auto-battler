import { styled } from 'styled-components';

import strengthImage from './images/biceps.png';
import dodgeImage from './images/fluffy-cloud.png';
import extraCardPlaysImage from './images/card-play.png';
import bleedImage from './images/drop.png';
import regenImage from './images/falling-leaf.png';
import burnImage from './images/flamer.png';
import heartPlusImage from './images/heart-plus.png';
import lightningBranchesImage from './images/lightning-branches.png';
import knockedOutStarsImage from './images/knocked-out-stars.png';
import arrowScopeImage from './images/arrow-scope.png';
import layeredArmorImage from './images/layered-armor.png';

import { PlayerState, StatusEffectType } from '../../../game/gameState';
import { IsSubtype } from '../../../utils/types';
import { maskImage } from '../../style';
import { Number } from '../shared/Number';
import { Row } from '../shared/Row';
import { getRelic } from '../../../game/utils/selectors';

type StatusEffectsWithoutIcons = IsSubtype<
  StatusEffectType,
  | 'lifestealWhenBurning'
  | 'temporaryFireCrit'
  | 'delayedShock'
  | 'temporaryDodge'
  | 'temporaryStrength'
>;
type VisibleStatusEffectType = Exclude<StatusEffectType, StatusEffectsWithoutIcons>;

const effectToImage: Record<VisibleStatusEffectType, string> = {
  bleed: bleedImage,
  dodge: dodgeImage,
  extraCardPlays: extraCardPlaysImage,
  strength: strengthImage,
  regen: regenImage,
  burn: burnImage,
  lifesteal: heartPlusImage,
  shock: lightningBranchesImage,
  stun: knockedOutStarsImage,
  crit: arrowScopeImage,
  thickSkin: layeredArmorImage,
};

const visibleStatusEffects = Object.keys(effectToImage) as VisibleStatusEffectType[];

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
  player: PlayerState;
}

function getDisplayedStatusEffectValue(player: PlayerState, effectType: VisibleStatusEffectType) {
  const value = player[effectType];

  if (value === Infinity) {
    return '';
  }

  return value;
}

export function StatusEffects({ player }: Props) {
  const calculatedStatusEffects = { ...player };

  if (player.burn > 0) {
    calculatedStatusEffects.lifesteal += player.lifestealWhenBurning;
  }

  const strengthWithDodge = getRelic(player, 'strengthWithDodge');
  if (strengthWithDodge && player.dodge > 0) {
    calculatedStatusEffects.strength += strengthWithDodge.value;
  }

  calculatedStatusEffects.dodge += player.temporaryDodge;
  calculatedStatusEffects.strength += player.temporaryStrength;

  return (
    <StatusEffectRow>
      {visibleStatusEffects.map(
        (effectName, i) =>
          !!calculatedStatusEffects[effectName] && (
            <StatusEffectValue key={i}>
              <Icon src={effectToImage[effectName]!} />
              <Number>{getDisplayedStatusEffectValue(calculatedStatusEffects, effectName)}</Number>
            </StatusEffectValue>
          ),
      )}
    </StatusEffectRow>
  );
}
