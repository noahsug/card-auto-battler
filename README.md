# Card Auto Battler

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

archtypes implemented

- strength - multihit, double strength, applies strength twice
- bleed - multihit, repeat, dmg for each bleed
- low hp - self damage, 50% lifesteal when < 50% health
- heal -
- trash -
- growth - play another card, perm +1 dmg each time played

## simple card effects

- gain 1 strength each turn
- reduce all dmg to 1 next turn
- gain dodge whenever you deal more than X damage
- dmg for each card played this turn

## archtypes

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
  - instead of dealing dmg, trash cards equal to dmg you would have delt
  - trash a card each turn, randomly play a trashed card (you still loose when you run out of cards)
  - dmg shields yourself instead, the game ends on round 10
  - play two cards per turn, trash cards played
  - dmg each time dodged
  - go second, start with better cards
  - bravest hero: need 10 wins to win, unlocks true ending
  - thief: play and trash an opponent card at the start of each battle
  - cards are in alphebetical order
  - cards are ordered by dmg delt (and random if they deal no dmg)
  - all cards are played twice, can only play 2 cards per turn

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
