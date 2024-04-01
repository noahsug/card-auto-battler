import { CardState } from './gameState';
import { createCard } from './utils';

// starter cards

export const damageStarterCard = createCard({ target: 'opponent', damage: 3 });

export const healStarterCard = createCard({ target: 'self', heal: 4 });

export const dodgeStarterCard = createCard({ target: 'self', dodge: 1 });

export const extraPlayStarterCard = createCard(
  { target: 'opponent', damage: 1 },
  { target: 'self', extraCardPlays: 1 },
);

export const bleedStarterCard = createCard({ target: 'opponent', bleed: 1 });

export const multihitStarterCard = createCard({ target: 'opponent', activations: 2, damage: 1 });

export const strengthStarterCard = createCard({ target: 'self', strength: 1 });

export const starterCardsByName = {
  damageStarterCard,
  healStarterCard,
  dodgeStarterCard,
  extraPlayStarterCard,
  bleedStarterCard,
  multihitStarterCard,
  strengthStarterCard,
};

// basic cards

export const damageCard = createCard({ target: 'opponent', damage: 5 });

export const extraPlayCard = createCard(
  { target: 'opponent', damage: 2 },
  { target: 'self', extraCardPlays: 1 },
);

export const healCard = createCard({ target: 'self', heal: 7 });

export const bleedCard = createCard({ target: 'opponent', bleed: 2 });

export const bleedTrashCard = createCard({ target: 'opponent', bleed: 3, trashSelf: true });

export const multihitCard = createCard({ target: 'opponent', activations: 3, damage: 1 });

export const strengthCard = createCard({ target: 'self', strength: 2 });

export const strengthTrashCard = createCard({ target: 'self', strength: 3, trashSelf: true });

export const trashCard = createCard({ target: 'opponent', trash: 2 });

export const basicCardsByName = {
  damageCard,
  extraPlayCard,
  healCard,
  bleedCard,
  bleedTrashCard,
  multihitCard,
  strengthCard,
  strengthTrashCard,
  trashCard,
};

// misc cards

export const damageForEachCard = createCard({
  target: 'opponent',
  trashSelf: true,
  damage: -1,
  gainEffectsList: [
    {
      effects: { damage: 1 },
      forEveryPlayerValue: {
        target: 'self',
        name: 'cards',
      },
    },
  ],
});

export const damageSelfIfMissCard = createCard(
  {
    target: 'opponent',
    damage: 7,
  },
  {
    target: 'self',
    damage: 4,
    ifBattleStat: {
      name: 'numberOfHits',
      comparison: '=',
      compareToValue: 0,
    },
  },
);

export const miscCardsByName = { damageForEachCard, damageSelfIfMissCard };

// strength synergy

export const doubleStrengthCard = createCard({
  target: 'self',
  gainEffectsList: [
    {
      effects: { strength: 1, trashSelf: true },
      forEveryPlayerValue: {
        target: 'self',
        name: 'strength',
      },
    },
  ],
});

export const appliesStrengthTwiceCard = createCard({
  target: 'opponent',
  damage: 3,
  gainEffectsList: [
    {
      effects: { damage: 1 },
      forEveryPlayerValue: {
        target: 'self',
        name: 'strength',
      },
    },
  ],
});

export const lifestealCard = createCard(
  {
    target: 'opponent',
    damage: 3,
  },
  {
    target: 'self',
    gainEffectsList: [
      {
        effects: { heal: 1 },
        forEveryBattleStat: {
          name: 'damageDealt',
        },
      },
    ],
  },
);

export const extraCardIfHighDamageCard = createCard(
  {
    target: 'opponent',
    damage: 3,
  },
  {
    target: 'self',
    gainEffectsList: [
      {
        effects: { extraCardPlays: 1, dodge: 1 },
        ifBattleStat: {
          name: 'damageDealt',
          comparison: '>=',
          compareToValue: 7,
        },
      },
    ],
  },
);

export const strengthCardsByName = {
  doubleStrengthCard,
  appliesStrengthTwiceCard,
  lifestealCard,
  extraCardIfHighDamageCard,
};

// bleed synergy

export const damageForEachBleedCard = createCard({
  target: 'opponent',
  damage: 1,
  activations: 0,
  gainEffectsList: [
    {
      effects: { activations: 1 },
      forEveryPlayerValue: {
        target: 'opponent',
        name: 'bleed',
      },
    },
  ],
});

export const doubleBleedCard = createCard({
  target: 'opponent',
  gainEffectsList: [
    {
      effects: { bleed: 1, trashSelf: true },
      forEveryPlayerValue: {
        target: 'opponent',
        name: 'bleed',
      },
    },
  ],
});

export const gainStrengthForBleedCard = createCard(
  {
    target: 'self',
    gainEffectsList: [
      {
        effects: { strength: 1 },
        forEveryPlayerValue: {
          target: 'opponent',
          name: 'bleed',
        },
      },
    ],
  },
  {
    target: 'opponent',
    bleed: 1,
  },
);

export const bothBleedCard = createCard(
  {
    target: 'opponent',
    bleed: 3,
  },
  {
    target: 'self',
    bleed: 3,
  },
);

export const extraPlayIfBleedCard = createCard(
  {
    target: 'opponent',
    damage: 4,
  },
  {
    target: 'self',
    gainEffectsList: [
      {
        effects: { extraCardPlays: 1 },
        ifPlayerValue: {
          target: 'opponent',
          name: 'bleed',
          comparison: '>',
          compareToValue: 0,
        },
      },
    ],
  },
);

export const bleedCardsByName = {
  damageForEachBleedCard,
  doubleBleedCard,
  gainStrengthForBleedCard,
  bothBleedCard,
  extraPlayIfBleedCard,
};

// low HP

export const selfDamageCard = createCard(
  { target: 'opponent', damage: 7 },
  {
    target: 'self',
    damage: 4,
    ifPlayerValue: {
      target: 'self',
      name: 'health',
      comparison: '>',
      compareToPlayerValue: {
        target: 'self',
        name: 'startingHealth',
      },
      multiplier: 0.5,
    },
  },
);

export const doubleDodgeIfLowHealthCard = createCard({
  target: 'self',
  dodge: 1,
  gainEffectsList: [
    {
      effects: { dodge: 1 },
      ifPlayerValue: {
        target: 'self',
        name: 'health',
        comparison: '<=',
        compareToPlayerValue: {
          target: 'self',
          name: 'startingHealth',
        },
        multiplier: 0.5,
      },
    },
  ],
});

export const extraPlayIfLowHealthCard = createCard({
  target: 'self',
  damage: 3,
  gainEffectsList: [
    {
      effects: { extraCardPlays: 3 },
      ifPlayerValue: {
        target: 'self',
        name: 'health',
        comparison: '<=',
        compareToPlayerValue: {
          target: 'self',
          name: 'startingHealth',
        },
        multiplier: 0.5,
      },
    },
  ],
});

export const setHealthToHalfCard = createCard({
  target: 'self',
  extraCardPlays: 1,
  gainEffectsList: [
    {
      effects: { damage: 1 },
      forEveryPlayerValue: {
        target: 'self',
        name: 'health',
      },
    },
    {
      effects: { heal: 1 },
      forEveryPlayerValue: {
        target: 'self',
        name: 'startingHealth',
      },
      divisor: 2,
    },
  ],
});

export const damageForEachMissingHealthCard = createCard({
  target: 'opponent',
  damage: 12,
  gainEffectsList: [
    {
      effects: { damage: -1 },
      forEveryPlayerValue: {
        target: 'self',
        name: 'health',
      },
      divisor: 2,
    },
  ],
});

export const lowHealthCardsByName = {
  selfDamageCard,
  doubleDodgeIfLowHealthCard,
  extraPlayIfLowHealthCard,
  setHealthToHalfCard,
  damageForEachMissingHealthCard,
};

// heal synergy

export const extraCardIfHighHealthCard = createCard(
  {
    target: 'self',
    heal: 3,
  },
  {
    target: 'self',
    gainEffectsList: [
      {
        effects: { extraCardPlays: 2 },
        ifPlayerValue: {
          target: 'self',
          name: 'health',
          comparison: '>=',
          compareToPlayerValue: {
            target: 'self',
            name: 'startingHealth',
          },
        },
      },
    ],
  },
);

export const extraPlayHealCard = createCard({ target: 'self', extraCardPlays: 1, heal: 3 });

export const healCardsByName = { extraCardIfHighHealthCard, extraPlayHealCard };

// mill synergy

export const trashAndTrashSelfCard = createCard({ target: 'opponent', trash: 3, trashSelf: true });

export const plusHealForEachTrashedCard = createCard({
  target: 'self',
  heal: 4,
  gainEffectsList: [
    {
      effects: { heal: 1 },
      forEveryPlayerValue: {
        target: 'opponent',
        name: 'trashedCards',
      },
    },
  ],
});

export const dodgeAndTrashCard = createCard(
  {
    target: 'self',
    dodge: 2,
    trash: 2,
    trashSelf: true,
  },
  {
    target: 'opponent',
    dodge: 2,
    trash: 2,
  },
);

export const trashForOpponentHealthCard = createCard({
  target: 'opponent',
  gainEffectsList: [
    {
      effects: { trash: 1 },
      forEveryPlayerValue: {
        target: 'opponent',
        name: 'health',
      },
      divisor: 5,
    },
  ],
});

export const millCardsByName = {
  trashAndTrashSelfCard,
  plusHealForEachTrashedCard,
  dodgeAndTrashCard,
  trashForOpponentHealthCard,
};

// trash synergy

export const trashAndExtraPlayCard = createCard({
  target: 'self',
  extraCardPlays: 2,
  trash: 2,
});

export const damageForEachTrashedCard = createCard({
  target: 'opponent',
  damage: 3,
  gainEffectsList: [
    {
      effects: { damage: 1 },
      forEveryPlayerValue: {
        target: 'opponent',
        name: 'trashedCards',
      },
    },
    {
      effects: { damage: 1 },
      forEveryPlayerValue: {
        target: 'self',
        name: 'trashedCards',
      },
    },
  ],
});

export const healForEachTrashedCard = createCard({
  target: 'self',
  heal: 4,
  gainEffectsList: [
    {
      effects: { heal: 1 },
      forEveryPlayerValue: {
        target: 'opponent',
        name: 'trashedCards',
      },
    },
    {
      effects: { heal: 1 },
      forEveryPlayerValue: {
        target: 'self',
        name: 'trashedCards',
      },
    },
  ],
});

export const trashCardsByName = {
  trashAndExtraPlayCard,
  damageForEachTrashedCard,
  healForEachTrashedCard,
};

// multicard synergy

export const extraPlaysTrashCard = createCard({
  target: 'self',
  extraCardPlays: 2,
  trashSelf: true,
});

export const damageForEachCardPlayedCard = createCard(
  {
    target: 'opponent',
    damage: 3,
  },
  {
    target: 'opponent',
    damage: 2,
    activations: 0,
    gainEffectsList: [
      {
        effects: { activations: 1 },
        forEveryPlayerValue: {
          target: 'self',
          name: 'cardsPlayedThisTurn',
        },
      },
    ],
  },
);

export const extraPlayIfExtraPlayCard = createCard(
  {
    target: 'opponent',
    damage: 1,
  },
  {
    target: 'self',
    extraCardPlays: 1,
    gainEffectsList: [
      {
        effects: { extraCardPlays: 1 },
        ifPlayerValue: {
          target: 'self',
          name: 'cardsPlayedThisTurn',
          comparison: '>',
          compareToValue: 0,
        },
      },
    ],
  },
);

export const multicardCardsByName = {
  damageForEachCardPlayedCard,
  extraPlayIfExtraPlayCard,
  extraPlaysTrashCard,
};

export const nonStarterCardsByName = {
  ...basicCardsByName,
  ...miscCardsByName,
  ...strengthCardsByName,
  ...bleedCardsByName,
  ...lowHealthCardsByName,
  ...healCardsByName,
  ...millCardsByName,
  ...trashCardsByName,
  ...multicardCardsByName,
};

export const cardsByName = {
  ...nonStarterCardsByName,
  ...starterCardsByName,
};

export const starterCards = Object.values(starterCardsByName);
export const basicCards = Object.values(basicCardsByName);
export const miscCards = Object.values(miscCardsByName);
export const strengthCards = Object.values(strengthCardsByName);
export const bleedCards = Object.values(bleedCardsByName);
export const lowHealthCards = Object.values(lowHealthCardsByName);
export const healCards = Object.values(healCardsByName);
export const millCards = Object.values(millCardsByName);
export const trashCards = Object.values(trashCardsByName);
export const multicardCards = Object.values(multicardCardsByName);

export const nonStarterCards = Object.values(nonStarterCardsByName);

Object.entries(cardsByName).forEach(([name, card]) => {
  card.name = name;
});

export const cardNames = Object.keys(cardsByName) as (keyof typeof cardsByName)[];
export type CardName = (typeof cardNames)[number];
export type CardNames = CardName[];

export const nonStarterCardNames = Object.keys(
  nonStarterCardsByName,
) as (keyof typeof nonStarterCardsByName)[];
export type NonStarterCardName = (typeof nonStarterCardNames)[number];
export type NonStarterCardNames = NonStarterCardName[];
