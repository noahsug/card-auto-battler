# Card Auto Battler

Game TODO:

1. add charms that help sort cards (e.g. feather = card is near top, anchor = card near bottom?,
   chain = two cards are always played after each other), 1 charm per card? but chains can grow in
   size
1. add way to remove cards (maybe also via charms?)
1. more enemies
1. more heros?
1. add more effects that allow you to play multiple cards or remove cards, since this gets you
   through a big deck faster and makes picking cards feel more impactful later in the game

Polish TODO:

1. save progress via local storage
2. queue activations (e.g. relics, effects) one at a time so it's more clear what's happening, and
   highlight the relic/status effect that triggered it
3. attack animation which triggers on each hit of the card
4. clicking a card zooms in on it and displays what each keyword does
5. loading screen
6. add progress view? (e.g. fight -> card -> fight -> card -> relic -> etc -> boss)
7. add achievements
8. add offline app download option (see Slay the Web)

Maybe TODO:

1. react-use-gesture for drag/drop (<https://codesandbox.io/p/sandbox/to6uf?file=%2Fsrc%2FApp.tsx%3A3%2C1-6%2C1>)
2. react-use-measure for positioning based on current ref width/height (<https://codesandbox.io/p/sandbox/ucvbf?file=%2Fsrc%2FApp.tsx%3A2%2C1-3%2C1>)

Performance TODO:

1. shrink all the images + allow the browser to pick which image to use (via css I think)
2. have relics/cards in GameState be a simple ID rather than the entire CardState/RelicState
3. <https://www.npmjs.com/package/@emotion/react> for smaller bundle size than styled
4. <https://github.com/pmndrs/zustand> or <https://github.com/pmndrs/jotai> to stop unnecessary renders
5. pre-load fonts, e.g:

```html
<link
  rel="preload"
  href="https://assets.slaytheweb.cards/fonts/heliotrope/heliotrope_4_regular.woff2"
  as="font"
  type="font/woff2"
  crossorigin=""
/>
```

## Art

Create card art via Gemini prompt: "Create an image that would match the text "Sucker Punch" in the style of a hand drawn illustration."

Remove background via <https://www.remove.bg/upload>

## Analysis

Analysis TODO:

1. Use multithreading (see section below)
2. 2-card priority list part II: try different pick strategy (e.g. look at all pairs in resulting deck)
3. inverse priority list: try to minimize win rate. Use this to sort bottom half of priority list
   and to find bugs (e.g. card is accidentally hitting self)
4. make card text super easy to read (add lots of keywords?)

### Multithreading

1. shard into X workers each taking on ITERATIONS/X
2. combine resulting cards -> win rates

We can do this for priority list generation AND weights by priority.

- Note: be careful about caching.
  - We don't want to refetch from disk a bunch of times. Maybe pass cached data into jest worker
    init?
  - We don't want to write to disk a bunch of times either
  - maybe call function before jest worker to ensure cache is hit, and then have each jest worker
    call it in init to ensure it's loaded into memory?

Create generic shardding function

- shardWork({ doWorkFn, iterations })
- doWorkFn(shardStartIndex, iterations)
- returns array of shards length containing results from doWorkFn

```js
const shardedPriorityWeightArray = shardWork({
  doWork: getPriorityWeightArrayByShard,
  iterations: maxPriority + 1,
});
const priorityWeightArray = combineArraysByKey(shardedPriorityWeightArray);

function getPriorityWeightArrayByShard({ startIndex, endIndex, totalIterations }) {
  const weightsByPriority = new Array(endIndex - startIndex);
  for (let i = startIndex; i < endIndex; i++) {
    const weight = getExpectedCardPicksAtPriority(i, totalIterations);
    weightsByPriority[i] = weight;
    // console.log('getPriorityWeightArray', `${i}/${maxPriority}`, weight);
  }
  return weightsByPriority;
}

combineArraysByKey(arrays) {
  const result = [];
  arrays.forEach(array => {
    array.forEach((index, value) => {
      result[index] = value;
    });
  });
}
```

### Meta Analysis (balance, difficulty, complexity, etc)

Start with best possible play, then remove information and measure the change of win rate

- blind to what's been picked so far = going for a build vs picking best card
- blind to battle number = scaling vs immediate benefit
- comparing n-card priority list = simplicity and strength of combos

Compare priority list with deck knowledge vs no deck knowledge

- no deck knowledge = created from a sorted weight list
- with deck knowledge = massaging list until best fit is found
- this speaks to card synergy

Train neural network at different depths to measure difficulty (aka easy win % vs hard win %)

Priority list of all cards shows best "generally good card" list

Priority lists of a particular strategy shows win rate for that strategy

- normal priority list generation logic, but cards form the category are always ranked highest
- the remaining cards are ranked according to "generally good card" list
- "strategy strength"

Generate priority lists for every combination of two strategies to show strategy synergy

Create AI that uses strategy heat map to choose best strategy priority list depending on which
cards it sees and has picked

- calculate % of each strategy path it's gone down so far combined with that strategies win rate
- show % of each strategy chosen and its win %, as well as overall win %
- good game health = no single strategy always dominating and smaller choose % = higher win %
  (e.g. if a strategy wins a lot it should be niche and hard to build)
- can pick from single strategies and combined strategies

Automatically find strategies (aka clusters)

- can start by using a manual function (e.g. look for cards with `bleed`)
- find priority list of length X that have a higher win rate when picked together, start
  with X = 2
- create simulation of X starter cards + Y cards to check for synergies / heuristics
  - how well a single card does
  - how good / bad are multiple copies of a card
  - identify card synergy clusters
  - how well does a synergy do early game vs late game

Find card / strategy heuristics

- for each card, what % of the deck do we want it to make up, penalty of multiple copies?
- what % of cards do we want from strategy vs from 'generally good cards'
- what's the 'strategy pull' for each card, aka how hard to we pivot to a strategy when a
  card is seen

Evaluate winning sets of cards are different stages of the game and use it for AI

- for battles 1-N, evaluate win rates of different card picks
- AI generates all possible decks and picks best path forward, balancing immediate win rate vs long
  term win rate
- run clustering algorithm to count # of valid strategies
- force AI to use particular strategy and evaluate win rate vs % of desired cards acquired
- look at card pick %, etc

### Heuristic evaluation

1. calculate a bunch of deck / card heuristics and metrics
2. use them to build a deck -> win rate prediction
3. use this to choose which two cards to pick (generating every possible decks from current deck + card picks)
4. Evaluate AI via win rate after 40k games

Heuristic: X card win rate by deck %

1. for 2...X cards, get win rate at different deck %s (e.g. 1/4 of deck, 1/5 of deck, etc)
2. other cards are filler cards (random starter cards? random cards? 3 damager card?)

Heuristic: Priority list position

- tells us strength of single card with no regard for deck
- this strength pertains to the success of an entire game, not just the next battle

Heuristic: Card pair priority list position

- tells us strength of a card pair with no regard for deck
- simple impl: pick the two cards according to the priority list
- complex impl: eval every resulting deck by summing priority weight of every pair

Deck -> win rate prediction

1. Take average win rate for every group of X cards

### Min-max evaluation

Min-max search using heuristic evaluation to determine fitness for each child node

Shallow min-max running simulations for best nodes

### Neural network evaluation (🐌)

Train a network to predict deck -> win rate:

1. For each battle #, generate set of possible player cards
2. play out battles and get win rate for those player cards
3. train neural network on cards in deck -> win rate (e.g. [0, 1, 1, 0, 2] -> 0.75)

Improving NN performance

1. make training data a bool array and cap how many times each card can appear
   - e.g. [0, 1, 1, 0, 2] becomes [false, true, true, false, true, /* array for dups */ false, false, false, false, true]
   - Brain.js doesn't seem to have this option
2. use a legit NN trainer written in python that's fed data form JS
   - we can use the trained weights in the JS network

This AI uses this neural net by generating all possible decks form card picks and choosing the
picks that the NN says have the highest win rate

### Fixed randomness AI (👎)

1. pre-determine picks
2. min max search w/ alpha beta pruning to find best pick in each situation
   1. for each battle, generate possible decks given card picks
      1. for each deck, run 500 simulations to determine win rate
         1. for each deck sorted by win rate, make those picks
3. cache deck -> picks
4. repeat for another pre-determined set of enemies and picks to iteratively build up overall win rate

The problem is this is super slow (36^6 nodes for each min-max search) and there are too many
possible decks for caching to have impact.

## gameplay

### Cards (10/23/24)

Colors

- green (nature, giant): scaling
- purple (shadow, sneaky): combos
- red (fire, monster): upfront damage

Green cards (heal, strength, high hp, high dmg, x = turn, toxic, chill)

- Heal for each card played this battle.
- Gain 3 strength.
- Deal damage equal to your last heal this battle.
- Apply 3 toxicity (-1/turn, take X damage at end of turn)
- Deal 4 damage. Play another card if this deals >= 7 damage.
- Deal 4 damage. This card is affected by strength three times.
- Deal damage equal to 30% of your current health.
- Gain 3 strength if your last card played was green.
- Enemy loses all armor. Deal 4 damage.
- Chill (-1/turn, 3 stacks = frozen = deal 0 damage this turn)
- Ice bolt: deals triple damage if enemy is frozen. Apply 1 chill.
- Double damage if no self buffs, remove all self effects
- Deal 10 damage if you dealt do damage last turn.
- Relic: your healing deals damage instead.
- Relic: +5 HP. Win the game when you reach 40 HP.
- Relic: ignore all damage <= 2
- Relic: +3 toxicity to self. +3 strength while toxic
- Relic: strength affects your healing
- Relic: you can only play 1 card. +3 strength

Red Cards (bleed, burn, fire spells, strength, multihit, lifesteal, low hp, trash, same name, armor)

- blood boil - gain 1 burn for each bleed
- deal 2 damage for each bleed
- apply 3 bleed
- revive with half HP if you die while burning
- Deal 4 damage. Lifesteal.
- Deals damage equal to the last damage you dealt.
- Deal 6 damage. Take 2 damage.
- Deal 7 damage. Trash.
- Deal damage equal to your missing health.
- Trash 2 cards, play 2 cards.
- Deal 3 damage. Play all other cards named X.
- Gain 6 armor.
- Gain 2 armor. Double your armor.
- Deal X damage, where X = times you've taken damage this battle.
- Deal +3 damage if you took damage this turn.
- Apply 5 bleed to self and opponent.
- Lose all armor, deal 2x damage.
- Lifesteal if your last card played was red.
- Apply 3 burn (-half/turn, take X damage at start of turn)
- Deal X damage where X = enemy burn.
- Double enemy burn.
- Execute: Deals double damage if the enemy has < 7 hp.
- Relic: "Fire" spells deal +2 damage while you're burning
- Relic: First card each battle is played twice.
- Relic: Deal +X damage for every consecutive turn you've taken damage.
- Relic: Deal +3 damage when bleeding / when at < 50% hp.
- Relic: Immune to damage on your turn.
- Relic: Gaining armor gives strength instead.
- Relic: Play an additional card. Apply a permanent 3 burn to self.
- Relic: Apply double burn while you have burn. Apply double bleed while you have bleed.

Purple Cards (% chance, crit, play again, debuff, dodge, shock, self-trash)

- Play another card.
- Deal 2 damage. Repeat for each card played this turn.
- This card is treated as the damaging card you used.
- Deal 1 damage 1-3 times.
- Deal 2 dodge.
- Apply -1 strength to enemy.
- Deal 2 damage. Deals double damage next time its played.
- End your turn. Gain 99 dodge until next turn.
- Apply 1 shock (-all stacks/turn, +X dmg this turn, 3 shock = stun = enemy skips next turn)
- Play the top card of the enemies deck
- Play again if the last card played was purple.
- The next card is a critical hit
- Deal 0 damage 3 times. 100% critical hit chance.
- Relic: Critical hits apply shock
- Relic: 25% chance to dodge damage.
- Relic: your next card deals 2x damage after you dodge
- Relic: Play another card for every 5 times the enemy takes damage.
- Relic: "Play another card" changes to "Repeat 1 additional time"
- Relic: shock only loses half stacks at end of turn
- Relic: Deal 1 damage whenever you play a card.
- Relic: ranges of values always give the best result
- Relic: +25% chance to crit after dodging.
- Relic: Play another card when you crit.
- Relic: cards with the same name deal +X damage, where X = # of those cards
- Relic: Basic punch cards are played twice.

Color Mechanics

- Do X if last card played is RED
- Deal X = # of RED cards

Color visual themes

- Green: giants, nature (plants, rocks, animals) - Leader = Treebeard
- Red: fire, blood, strength, monsters - Leader = Battle Mage
- Purple: reflexes, punches, shadow - Leader = Shadowy Boxer

Shuffle mechanics

- Cards are played in alphabetical order / order picked up / by color (R,P,G) / by damage
- This card is always played before/after a RED card if possible
- Choose card order
- Choose combos (strings of cards)

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

### simple card effects

- gain 1 strength each turn
- reduce all dmg to 1 next turn
- gain dodge whenever you deal more than X damage
- dmg for each card played this turn

### archetypes

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

### relic reward screen

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

## Card Structure V2

```js
OpponentEffects = {
  damage: 1,
  bleed: 1,
  trash: 1,
};

SelfEffects = {
  extraCardPlays: 1,
  dodge: 1,
  strength: 1,
};

CardEffects = {
  ...OpponentEffects,
  ...SelfEffects,
  singleUse: false,
};

CardState = {
  ...CardEffects,
  // self targeting effects that usually affect the opponent
  self: OpponentEffects,
  // opponent targeting effects that usually affect self
  opponent: SelfEffects,
  // effects that trigger when you're at half HP or less
  lowHp: CardEffects, // rally
};

CardEffect = {
  damage,
  heal,
  bleed,
  dodge,
  strength,
  trash,
  play,
  times,
}

CardState = {
  ...CardEffect,
  trashSelf,
}


Card = {
  effects: [{
    target: 'enemy',
    effect: 'damage',
    value: 1,
    times: 3,
  },
  modify: {
    effect: 'damage',
    value: 2,
    if: {

      check: 'lowHp',
    }
  }
  {
    target: 'card',
    effect: 'damage',
    value: 2,
    if: {
      check: 'lowHp',
      value: true,
    }
  }],
  modify: {
    damage: 2,
    ifLowHP: true,
  },
  repeat: {

  }
}


// ----------- final card wording

// Deal 10 damage.
// Gain 4 HP.
// Apply 2 bleed.
// Gain 1 poison.
// Enemy gains 2 strength.
// You Trash 2 cards.
// Enemy Trashes 2 cards.
// Play two cards.
// Trash.

// Play the top damage card of your deck.

// Deal 1 damage 3 times.
// Rally: Deals double damage.

// Deal 1 damage 3 times.
// Rally: Each hit deals 2 extra damage.

// Deal 1 damage 3 times.
// Each hit deals 2 extra damage if you have less than half HP.

// Deal 1 damage 3 times.
// Rally: Each hit deals 2 extra damage.

// Deal 5 damage.
// Deals double damage if you have less than half HP.

// Set your HP to half.

// Deal 3 damage.
// Deals extra damage for every 5 missing health.

// Deal 10 damage.
// Misses if you have more HP than the enemy.

// Deal 10 damage.
// Take 5 damage if this misses.

// Deal 1 damage 3 times.
// Momentum: Each hit deals extra damage equal to your bleed (3).

// Deal 3 damage.
// Powerful Blow: Lifesteal. // triggers if this card does double it's original damage (6)
// Gains Lifesteal if this card deals >= 7 damage.
// Gain HP equal to damage dealt if this card deals at least 7 damage.

// Deal 3 damage.
// Apply bleed equal to damage dealt.

// Deal 3 damage.
// Deals 5 extra damage if the enemy is bleeding.
// is poisoned.
// has at least 1 strength.

// Deal damage equal to two times the enemy's bleed (3).

// Deal 3 damage. Deals extra damage equal to the enemy's bleed (3).

// Deal 2 damage. Deals extra damage equal to the number of cards you've played this turn.

// Deal 1 damage.
// Deals extra damage equal to your strength (6). // re-write to "This card is effected by strength twice"

// Gain strength equal to 2 times your strength. // rewrite to "Triple your strength."

// Apply bleed equal to 2 times the enemy's bleed. // rewrite to "Triple the enemy's bleed."

// Apply 5 bleed and gain 5 bleed.

// Heal 3 and gain 3 strength.

// Deal 1 damage. Play 1 card.
// Momentum: Play 1 card. // triggers when you've played more than one card this turn.

// Gain 1 Dodge for every 4 cards you play.

// Enemy cards deal 1 less damage for the next 3 turns.

// ALL damage is reduced by 2 for the next 3 turns.

// Deal 1 damage.
// Repeat for each bleed you have (3).
// Repeat for each bleed the enemy has (3).

// ----------- brainstorming


// Deal 1 damage X times.
// X = the enemy's bleed.

// Deal 1 damage for each bleed stack on the enemy.
// Deal 1 damage for each of the enemy's bleed.

// Deal 1 damage.
// Repeat for each bleed stack on the enemy (3).
// Repeat for each enemy bleed stack (3).
// Repeat for each self bleed stack (3).
// Repeat for each of your bleed stacks.
// Repeat for each stack of bleed on you.

// Deal 1 damage 3 times.
// Rally: +3 damage.
// - or -
// Deal 1 + X damage 3 times.
// X = 0.
// Rally: X = 3.
// Deal 1 damage 3 times.
// Rally: Increase each damage dealt by +3.

// Deal 1 + X damage.
// X = your bleed. (BAD)
// - or -
// Deal 1 damage.
// +X damage.
// X = your bleed. (BAD)
// - or -
// Deal 1 damage.
// Deal extra damage equal to your bleed. (GOOD)
// - or -
// Deal 1 damage.
// Increase damage dealt by 1 for each stack of your bleed. (GOOD)

// Deal 1 damage 3 times.
// Rally:  is increased equal to your bleed. (GOOD)

// Deal 2 damage X times.
// X = Enemy's bleed. (BAD)
// - or -
// Deal 2 damage for each of your enemy's bleed. (BAD)
// - or -
// Deal 2 damage.
// Repeat for each of your enemy's bleed. (BAD)
// - or -
// For each enemy bleed: Deal 2 damage. (BAD)

// Deal 2 damage for each of your bleed. (BAD)
// - or -
// For each of your bleed: Deal 2 damage. (BAD)

// Deal 2 damage.
// Rally: Repeat for each of your enemy's bleed.
// - or -
// Deal 2 damage X times.
// X = 1
// Rally: X = enemy's bleed

// Deal damage equal to 2 times your enemy's bleed.
// - or -
// Deal N damage.
// N = 2 times enemy's bleed

// Apply 3 bleed.

// Gain strength equal to your enemy's bleed.
// Enemy gains strength equal to their bleed.

// Deal 10 damage.
// Apply 2 bleed.
// Enemy gains 2 strength.
// You Trash 2 cards.
// Enemy Trashes 2 cards.

// Gain X strength.
// X = 2x your strength.
//  - or -
// Gain strength equal to 2 times your strength.
// (shorten in render to "Triple your strength.")

// Inflect poison equal to your enemy's poison. (shorten to "Double the enemy's poison.")
// Exhaust.

// Deal 10 damage.
// Take 5 damage.

// Deal 1 damage.
// Play an extra card.
// Momentum: Play an extra card. (Momentum: triggers when this is your played more than one card has been played this turn)

{
  damage: 10,
  self: {
    damage: 10,
  }
  rally: {
    bleed: 2
  }
}
```

## Card Structure V1

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
