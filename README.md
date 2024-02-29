# Card Auto Battler

## analysis

always play best card strategy

- seed by playing randomly, then sorting by win rate: 47.4% win rate
- seed by playing randomly, then sorting by confidence score: 46% win rate
- iteratively playing and updating card priority: 39% win rate
- iteratively train neural network on input of win rate -> confidence score for each card
- iteratively train neural network on input of confidence score for each card -> win rate then
  iterate over random values returning best predicted score

## gameplay

effects implemented

- bleed: 0,
- extraCardPlays: 0,
- dodge: 0,
- strength: 0
- damage
- repeat
- effect from player value
- heal
- lifesteal

archetypes implemented

- strength - multihit, double strength, applies strength twice
- bleed - multihit, repeat, dmg for each bleed
- low hp - self damage, 50% lifesteal when < 50% health, set health to half
- no self buffs - double damage if no self buffs, remove all self effects
- mill (heal, dodge, trash) - heal 7 and deal damage for every health over max
- trash -
- multicard - +1 damage for each card played this turn

## simple card effects

- gain 1 strength each turn
- reduce all dmg to 1 next turn
- gain dodge whenever you deal more than X damage
- dmg for each card played this turn

## archetypes

- buff stacking (next dmg card is played twice, +2 dmg, applies bleed for each dmg, 2x damage, 25% lifesteal, etc)
- ✅ bleed (hit 3 times, bleed 2, hit for each bleed, dmg causes bleed, 2x bleed)
- growth (+1 dmg each time played, +1 multihit each time played, heal +1 each time played, add X to deck)
- shuffle (+1 dmg for each card played this turn, +1 multihit for each shuffle, shuffle cards and play a card)
- many cards (1 dmg for each card in deck/discard)
- trash (add X to deck that trashes when played, trash 2 play 2, dmg for each trashed card, opponent trashes all cards played next turn, trash = heal 1)
- random (random debuff, random events have multihit)
- card selection (embeds in 2nd card picked - multihit 1, +2 dmg, always played first)
- low health (X when < 50% health - life steal, multihit, self damage, bleed self, +1 strength when dealing self damage, when < opponent health do X)
- high health (heal 4, regen 3, blessed +X health when restoring health, lifesteal, deal 50% of healed dmg, multihit when health > 10)
- non-damaging cards (non-damaging cards have play another card, non-damaging have +3 heal, no damage can be delt until your next turn)
- block (3 block - stops X damage then block is reduced by X, deal dmg = to block, 2x block, multihit when block > 10)

## relic reward screen

- 25% life steal while HP is lower than 50%
- upgrades are 2x more likely to be seen
- play first each battle twice
- deal one dmg at the end of your turn
- always get an upgrade option each card selection
- Jesus Take the Wheel: card selections made for you at random, double your max HP (you can still pick relics)
- more relics
- more enemies
- more selectable characters
- game engine analysis

achievements
view hero + relics + deck
shuffle deck aniation

- card effects

  - heal
  - dmg
  - lifesteal
  - crit chance
  - trash card
  - next turn play card twice if dmg is dealt
  - play another card
  - permanent +1 dmg each time used
  - play card(s) with highest dmg, trash
  - loose half current HP, all cards have lifesteal, trash
  - upgrade (replaces lesser version of card w/ same name, happens when playing 2 of the same card?)
  - dodge
  - every 5 turns played, gain dodge
  - upgrades infinitely
  - play once per turn whenever you heal
  - adds a wound to your draw pile
  - play all trashed cards
  - play all opponent cards trashed by you
  - immediately played when deck is shuffled
  - stun
  - once per turn

- characters
  - all dmg printed on cards is reduced by 50%, you have lifesteal
  - 50% more likely to see cards you already own
  - can remove a card instead of taking a new card
  - healing is 50% more effective, dmg is 50% less effective, win if you reach 50 life
  - instead of dealing dmg, trash cards equal to dmg you would have dealt
  - trash a card each turn, randomly play a trashed card (you still loose when you run out of cards)
  - dmg shields yourself instead, the game ends on round 10
  - play two cards per turn, trash cards played
  - dmg each time dodged
  - go second, start with better cards
  - bravest hero: need 10 wins to win, unlocks true ending
  - thief: play and trash an opponent card at the start of each battle
  - cards are in alphabetical order
  - cards are ordered by dmg dealt (and random if they deal no dmg)
  - all cards are played twice, can only play 2 cards per turn

## Example Cards

```js
// deal 10 damage and 5 damage to self
const cardSelfDamage = {
  target: 'opponent',
  damage: 10,
  then: {
    target: 'self',
    damage: 5,
  },
};

// deal 1 damage for each bleed, heal 1 3 times
const cardDamageForEachBleedAndHeal = {
  target: 'opponent',
  damage: 1,
  activations: 0,
  gainEffects: {
    effects: { activations: 1 },
    forEveryPlayerValue: {
      target: 'opponent',
      name: 'bleed',
    },
  },
  then: {
    target: 'self',
    heal: 1,
    activations: 3,
  },
};

// deal 1, 2, 3 damage
const cardMultiDamage = {
  target: 'opponent',
  damage: 1,
  then: {
    target: 'opponent',
    damage: 2,
    then: {
      target: 'opponent',
      damage: 3,
    },
  },
};

// +3 heal and +1 dodge for every 5 cards played this turn
const cardDamageAndHealForEach = {
  target: 'self',
  gainEffects: {
    effects: { heal: 3, dodge: 1 },
    forEveryPlayerValue: {
      target: 'self',
      name: 'cardsPlayedThisTurn',
    },
    divisor: 5,
  },
};

// deal 5 damage, +1 dodge if hit
const cardDodgeOnHit = {
  target: 'opponent',
  damage: 5,
  then: {
    target: 'self',
    dodge: 1,
    ifDamageDealt: {
      comparator: '>',
      compareToValue: 0,
    },
  },
};

// deal 1 damage for each opponent trashed card, heal 1 for each hit
const cardDamageForEachTrashedCard = {
  target: 'opponent',
  damage: 1,
  gainEffects: {
    effects: { activations: 1 },
    forEveryPlayerValue: {
      target: 'opponent',
      name: 'trashedCards',
    },
  },
  then: {
    target: 'self',
    gainEffects: {
      effects: { heal: 1 },
      forEveryHit: true,
    },
  },
};

// 1 damage, grow: +1 damage permanently on hit
const cardDamageAndGrowOnHit = {
  target: 'opponent',
  damage: 1,
  growEffects: {
    effects: { damage: 1 },
    isPermanent: true,
    ifDamageDealt: {
      comparator: 'greaterThan',
      compareToValue: 0,
    },
  },
};

// deal 1 damage, grow: +1 strength permanently on hit
const cardDamageAndGrowStrOnHit = {
  target: 'opponent',
  damage: 1,
  and: {
    target: 'self',
    grow: {
      // always happens after damage and other effects
      effects: { strength: 1 },
      isPermanent: true,
      ifDamageDealt: {
        comparator: 'greaterThan',
        compareToValue: 0,
      },
    },
  },
};

// deal 1 damage, +1 dodge for each damage done
const cardDamageAndBleedForEachDmg = {
  target: 'opponent',
  damage: 1,
  then: {
    target: 'self',
    gainEffects: {
      effects: { dodge: 1 },
      forEveryDamage: true,
    },
  },
};

// 2 damage, grow: double damage
const cardDoubleGrowth = {
  target: 'opponent',
  damage: 2,
  growth: {
    effects: { damage: 2 },
    isMultiplicative: true,
    isPermanent: false,
  },
};

// +1 damage for each card in deck, double damage if opponent health < 50%
const cardDoublingDamage = {
  target: 'opponent',
  gainEffects: [
    {
      effects: { damage: 1 },
      forEveryPlayerValue: {
        target: 'self',
        name: 'cards',
      },
    },
    {
      effects: { damage: 2 },
      isMultiplicative: true,
      ifPlayerValue: {
        target: 'opponent',
        name: 'health',
        comparator: 'lessThan',
        compareToValue: 50,
      },
    },
  ],
};

// 1 heal 1x times, grow: +1 heal, +1x times
const cardHealAndGrow = {
  target: 'self',
  heal: 1,
  activations: 1,
  grow: {
    effects: { heal: 1, activations: 1 },
    isPermanent: true,
  },
};

// deal 1 damage for each bleed or apply bleed 2 if opponent has no bleed
const cardDamageOrBleed = {
  target: 'opponent',
  damage: 1,
  gainEffects: {
    effects: { activations: 1 },
    forEveryPlayerValue: {
      target: 'opponent',
      name: 'bleed',
    },
  },
  ifPlayerValue: {
    target: 'opponent',
    name: 'bleed',
    comparator: 'greaterThan',
    compareToValue: 0,
  },
  else: {
    target: 'opponent',
    bleed: 2,
  },
};

// deal 1 damage and heal 1, grow: +2 damage and +2 heal
const cardGrowOnUse = {
  target: 'opponent',
  damage: 1,
  grow: {
    effects: { damage: 2 },
  },
  then: {
    target: 'self',
    heal: 1,
    grow: {
      effects: { heal: 2 },
    },
  },
};

// deal 2 damage +2 damage for each opponent bleed
const cardDamagePlusDamageForEachBleed = {
  target: 'opponent',
  damage: 2,
  gainEffects: {
    effects: { damage: 2 },
    forEveryPlayerValue: {
      target: 'opponent',
      name: 'bleed',
    },
  },
};

// deal 2 damage 2 times, affected by strength twice
const cardDoubleStrength = {
  damage: 2,
  activations: 2,
  gainEffects: {
    effects: { damage: 1 },
    forEveryPlayerValue: {
      target: 'self',
      name: 'strength',
    },
  },
};

// deal 1 damage and 1 bleed, repeat if opponent health < 50%
const cardRepeatOnCondition = {
  target: 'opponent',
  damage: 1,
  bleed: 1,
  gainEffects: {
    effects: { activations: 1 },
    ifPlayerValue: {
      target: 'opponent',
      name: 'health',
      comparator: 'lessThan',
      compareToValue: 50,
    },
  },
};

// apply 1 random negative status effect and gain 1 random positive status effect
const cardRandomStatusEffect = {
  target: 'opponent',
  randomNegativeStatusEffects: 1,
  then: {
    target: 'self',
    gainRandomPositiveStatusEffect: 1,
  },
};

// double your strength, trash
const cardDoubleStrengthAndTrash = {
  target: 'self',
  gainEffects: {
    effects: { strength: 1 },
    forEveryPlayerValue: {
      target: 'self',
      name: 'strength',
    },
  },
  trashSelf: true,
};

// gain 1 dodge, play another card if your health > opponent health
const cardDodgeAndPlayAnother = {
  target: 'self',
  dodge: 1,
  gainEffects: {
    effects: { extraCardPlays: 1 },
    ifPlayerValue: {
      target: 'self',
      name: 'health',
      comparator: 'greaterThan',
      compareToPlayerValue: {
        target: 'opponent',
        name: 'health',
      },
    },
  },
};

// 1 damage for every 3 cards in deck
const cardDamageForDeckSize = {
  target: 'opponent',
  gainEffects: {
    effects: { damage: 1 },
    forEveryPlayerValue: {
      target: 'self',
      name: 'cards',
    },
    divisor: 3,
  },
};

// trash 2 cards, +1 heal for each card trashed this battle
const cardTrashAndHeal = {
  target: 'self',
  trash: 2,
  then: {
    target: 'self',
    gainEffects: {
      effects: { heal: 1 },
      forEveryPlayerValue: {
        target: 'self',
        name: 'trashedCards',
      },
    },
  },
};

// lifesteal, deal 3 damage
const cardLifestealAndDamage = {
  target: 'opponent',
  damage: 3,
  then: {
    target: 'self',
    gainEffects: {
      effects: { heal: 1 },
      forEveryDamage: true,
    },
  },
};

// deal 5 damage, play another card of damage dealt is > 7
const cardDamageAndPlayAnother = {
  target: 'opponent',
  damage: 5,
  then: {
    gainEffects: {
      effects: { extraCardPlays: 1 },
      ifDamageDealt: {
        comparator: 'greaterThan',
        compareToValue: 7,
      },
    },
  },
};
```

---

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.
