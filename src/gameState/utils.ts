import { CardEffects, CardState, GainEffectsOptions, GainableCardEffects } from './gameState';
import { MakeOptional } from '../utils/types';

const DEFAULT_GAINABLE_CARD_EFFECTS: GainableCardEffects = {
  damage: 0,
  randomNegativeStatusEffects: 0,
  randomPositiveStatusEffects: 0,
  // cause target to trash X cards
  trash: 0,
  // trash this card after use
  trashSelf: false,
  activations: 1,

  bleed: 0,
  extraCardPlays: 0,
  dodge: 0,
  strength: 0,
};

const DEFAULT_CARD_EFFECTS: Omit<CardEffects, 'target'> = {
  ...DEFAULT_GAINABLE_CARD_EFFECTS,
  gainEffectsList: [],
  growEffectsList: [],
};

const DEFAULT_GAIN_EFFECTS_OPTIONS: Omit<GainEffectsOptions, 'effects'> = {
  isMultiplicative: false,
  divisor: 1,
};

type GainEffectsOptionsWithDefaults = MakeOptional<
  GainEffectsOptions,
  keyof typeof DEFAULT_GAIN_EFFECTS_OPTIONS
>;

type GainableCardEffectsWithDefaults = MakeOptional<
  GainableCardEffects,
  keyof typeof DEFAULT_GAINABLE_CARD_EFFECTS
>;

interface CreateGainEffectsOptions extends Omit<GainEffectsOptionsWithDefaults, 'effects'> {
  effects: GainableCardEffectsWithDefaults;
}

type CardEffectsWithDefaults = MakeOptional<CardEffects, keyof typeof DEFAULT_CARD_EFFECTS>;

interface CreateCardEffectsList extends Omit<CardEffectsWithDefaults, 'gainEffectsList'> {
  gainEffectsList?: CreateGainEffectsOptions[];
}

function createGainEffectsList(gainEffectsList: CreateGainEffectsOptions[]): GainEffectsOptions[] {
  return gainEffectsList?.map((createGainEffectsOptions) => {
    const effects = Object.assign(
      {},
      DEFAULT_GAINABLE_CARD_EFFECTS,
      createGainEffectsOptions.effects,
    );
    return Object.assign({ effects }, DEFAULT_GAIN_EFFECTS_OPTIONS, createGainEffectsOptions);
  });
}

export function createCard(...createEffectsListOptions: CreateCardEffectsList[]): CardState {
  const effectsList = createEffectsListOptions.map((createCardEffectsOptions) => {
    const gainEffectsList = createCardEffectsOptions.gainEffectsList
      ? createGainEffectsList(createCardEffectsOptions.gainEffectsList)
      : [];

    return Object.assign({ gainEffectsList }, DEFAULT_CARD_EFFECTS, createCardEffectsOptions);
  });

  return {
    effects: effectsList,
  };
}
