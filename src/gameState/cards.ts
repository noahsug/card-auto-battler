import { createCard } from './utils';

// starter cards

export const damageStarterCard = createCard({ target: 'opponent', damage: 3 });

export const healStarterCard = createCard({ target: 'self', heal: 4 });

export const dodgeStarterCard = createCard({ target: 'self', dodge: 1 });

export const extraPlayStarterCard = createCard({ target: 'self', extraCardPlays: 1, damage: 1 });

export const bleedStarterCard = createCard({ target: 'opponent', bleed: 1 });

export const multihitStarterCard = createCard({ target: 'opponent', activations: 2, damage: 1 });

export const strengthStarterCard = createCard({ target: 'self', strength: 1 });

export const healTrashStarterCard = createCard({ target: 'self', heal: 7 });

export const damageTrashStarterCard = createCard({ target: 'opponent', damage: 5 });

const starterCards = {
  damageStarterCard,
  healStarterCard,
  dodgeStarterCard,
  extraPlayStarterCard,
  bleedStarterCard,
  multihitStarterCard,
  strengthStarterCard,
  damageTrashStarterCard,
  healTrashStarterCard,
};

// basic cards

export const damageCard = createCard({ target: 'opponent', damage: 5 });

export const extraPlayCard = createCard({ target: 'self', extraCardPlays: 1, damage: 2 });

export const healCard = createCard({ target: 'self', heal: 7 });

export const bleedCard = createCard({ target: 'opponent', bleed: 2 });

export const bleedTrashCard = createCard({ target: 'opponent', bleed: 3, trashSelf: true });

export const multihitCard = createCard({ target: 'opponent', activations: 3, damage: 1 });

export const strengthCard = createCard({ target: 'self', strength: 2 });

export const strengthTrashCard = createCard({ target: 'self', strength: 3, trashSelf: true });

export const trashCard = createCard({ target: 'opponent', trash: 2 });

const basicCards = {
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
  gainEffectsList: [
    {
      effects: { damage: 1 },
      forEveryPlayerValue: {
        target: 'self',
        name: 'cards',
      },
      divisor: 2,
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
      comparison: '>',
      compareToValue: 0,
    },
  },
);

const miscCards = { damageForEachCard, damageSelfIfMissCard };

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
  target: 'self',
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

const strengthCards = {
  doubleStrengthCard,
  appliesStrengthTwiceCard,
  lifestealCard,
  extraCardIfHighDamageCard,
};

// bleed synergy

export const damageWithoutConsumingBleedCard = createCard(
  {
    target: 'opponent',
    damage: 1,
    activations: 2,
  },
  {
    target: 'opponent',
    gainEffectsList: [
      {
        effects: { bleed: 1 },
        forEveryBattleStat: {
          name: 'numberOfHits',
        },
      },
    ],
  },
);

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

export const extraPlayIfBleedCard = createCard({
  target: 'self',
  damage: 4,
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
});

const bleedCards = {
  damageWithoutConsumingBleedCard,
  damageForEachBleedCard,
  doubleBleedCard,
  gainStrengthForBleedCard,
  bothBleedCard,
  extraPlayIfBleedCard,
};

// low HP

export const selfDamageCard = createCard(
  { target: 'self', damage: 7 },
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
      effects: { extraCardPlays: 2 },
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

const lowHealthCards = {
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

const healCards = { extraCardIfHighHealthCard, extraPlayHealCard };

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

const millCards = {
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
  target: 'opponent',
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

const trashCards = { trashAndExtraPlayCard, damageForEachTrashedCard, healForEachTrashedCard };

// multicard synergy

const extraPlaysTrashCard = createCard({ target: 'self', extraCardPlays: 2, trashSelf: true });

export const damageForEachCardPlayedCard = createCard({
  target: 'opponent',
  damage: 3,
  gainEffectsList: [
    {
      effects: { damage: 2 },
      forEveryPlayerValue: {
        target: 'self',
        name: 'cardsPlayedThisTurn',
      },
    },
  ],
});

export const extraPlayIfExtraPlayCard = createCard({
  target: 'self',
  damage: 1,
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
});

const multicardCards = {
  damageForEachCardPlayedCard,
  extraPlayIfExtraPlayCard,
  extraPlaysTrashCard,
};

const starterCardArray = Object.values(starterCards);
const basicCardArray = Object.values(basicCards);
const miscCardArray = Object.values(miscCards);
const strengthCardArray = Object.values(strengthCards);
const bleedCardArray = Object.values(bleedCards);
const lowHealthCardArray = Object.values(lowHealthCards);
const healCardArray = Object.values(healCards);
const millCardArray = Object.values(millCards);
const trashCardArray = Object.values(trashCards);
const multicardCardArray = Object.values(multicardCards);

const nonStarterCards = {
  ...starterCards,
  ...basicCards,
  ...miscCards,
  ...strengthCards,
  ...bleedCards,
  ...lowHealthCards,
  ...healCards,
  ...millCards,
  ...trashCards,
  ...multicardCards,
};

const allCards = {
  ...nonStarterCards,
  ...starterCards,
};

const nonStarterCardArray = Object.values(nonStarterCards);

export {
  allCards as cardsByName,
  nonStarterCardArray as nonStarterCards,
  starterCardArray as starterCards,
  basicCardArray as basicCards,
  miscCardArray as miscCards,
  strengthCardArray as strengthCards,
  bleedCardArray as bleedCards,
  lowHealthCardArray as lowHealthCards,
  healCardArray as healCards,
  millCardArray as millCards,
  trashCardArray as trashCards,
  multicardCardArray as multicardCards,
};
