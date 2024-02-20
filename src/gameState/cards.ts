import { createCard } from './utils';

// starter cards

const damageStarterCard = createCard({ target: 'opponent', damage: 3 });

const healStarterCard = createCard({ target: 'self', heal: 4 });

const dodgeStarterCard = createCard({ target: 'self', dodge: 1 });

const extraPlayStarterCard = createCard({ target: 'self', extraCardPlays: 1, damage: 1 });

const bleedStarterCard = createCard({ target: 'opponent', bleed: 2 });

const multihitStarterCard = createCard({ target: 'opponent', activations: 2, damage: 1 });

const strengthStarterCard = createCard({ target: 'self', strength: 1 });

const starterCards = {
  damageStarterCard,
  healStarterCard,
  dodgeStarterCard,
  extraPlayStarterCard,
  bleedStarterCard,
  multihitStarterCard,
  strengthStarterCard,
};

// basic cards

const damageCard = createCard({ target: 'opponent', damage: 5 });

const extraPlayCard = createCard({ target: 'self', extraCardPlays: 1, damage: 3 });

const healCard = createCard({ target: 'self', heal: 7 });

const bleedCard = createCard({ target: 'opponent', bleed: 3 });

const multihitCard = createCard({ target: 'opponent', activations: 3, damage: 1 });

const strengthCard = createCard({ target: 'self', strength: 2 });

const trashCard = createCard({ target: 'opponent', trash: 2 });

const basicCards = {
  damageCard,
  extraPlayCard,
  healCard,
  bleedCard,
  multihitCard,
  strengthCard,
  trashCard,
};

// strength synergy

const doubleStrengthCard = createCard({
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

const appliesStrengthTwiceCard = createCard({
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

const lifestealCard = createCard(
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

const strengthCards = { doubleStrengthCard, appliesStrengthTwiceCard, lifestealCard };

// bleed synergy

const damageWithoutConsumingBleedCard = createCard(
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

const damageForEachBleedCard = createCard({
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

const doubleBleedCard = createCard({
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

const bleedCards = { damageWithoutConsumingBleedCard, damageForEachBleedCard, doubleBleedCard };

// low HP

const selfDamageCard = createCard(
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

const doubleDodgeIfLowHealthCard = createCard({
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

const extraPlayIfLowHealthCard = createCard({
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

const setHealthToHalfCard = createCard({
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

const lowHealthCards = {
  selfDamageCard,
  doubleDodgeIfLowHealthCard,
  extraPlayIfLowHealthCard,
  setHealthToHalfCard,
};

// mill synergy

const plusHealForEachTrashedCard = createCard({
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

const dodgeAndTrashCard = createCard(
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

const trashForOpponentHealthCard = createCard({
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

const millCards = { plusHealForEachTrashedCard, dodgeAndTrashCard, trashForOpponentHealthCard };

// trash synergy

const trashAndExtraPlayCard = createCard({
  target: 'self',
  extraCardPlays: 2,
  trash: 2,
});

const damageForEachTrashedCard = createCard({
  target: 'opponent',
  damage: 2,
  gainEffectsList: [
    {
      effects: { activations: 1 },
      forEveryPlayerValue: {
        target: 'opponent',
        name: 'trashedCards',
      },
    },
    {
      effects: { activations: 1 },
      forEveryPlayerValue: {
        target: 'self',
        name: 'trashedCards',
      },
    },
  ],
});

const trashCards = { trashAndExtraPlayCard, damageForEachTrashedCard };

// multicard synergy

const damageForEachCardPlayedCard = createCard({
  target: 'opponent',
  damage: 2,
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

const multicardCards = { damageForEachCardPlayedCard };

const allCards = {
  ...starterCards,
  ...basicCards,
  ...strengthCards,
  ...bleedCards,
  ...lowHealthCards,
  ...millCards,
  ...trashCards,
  ...multicardCards,
};

export {
  allCards as cards,
  starterCards,
  basicCards,
  strengthCards,
  bleedCards,
  lowHealthCards,
  millCards,
  trashCards,
  multicardCards,
};
