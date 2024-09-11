import channel from './images/cards/channel.jpeg';
import eviscerate from './images/cards/eviscerate.jpeg';
import firePower from './images/cards/fire-power.jpeg';
import fireball from './images/cards/fireball.png';
import parry from './images/cards/parry.png';
import phoenix from './images/cards/phoenix.jpeg';
import punch from './images/cards/punch.png';
import volcano from './images/cards/volcano.jpeg';

export const allCards = {
  punch: {
    name: 'Serious Punch',
    description: 'Deal 7 damage.',
    imageName: punch,
  },
  fireball: {
    name: 'Fireball',
    description:
      'Deal 4 damage. Deal 3 extra damage for each burn the enemy has. Remove all enemy burn.',
    imageName: fireball,
  },
  eviscerate: {
    name: 'Eviscerate',
    description: 'Deal 2 damage. Repeat for each bleed the enemy has.',
    imageName: eviscerate,
  },
};

export type CardName = keyof typeof allCards;
