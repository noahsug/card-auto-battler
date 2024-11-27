import warrior from './images/warrior.png';
import { PlayerInfo } from '../../game/gameState';
import { cardsByName } from '../cards';

export const allHeroes = {
  warrior: {
    name: 'Warrior',
    image: warrior,
    cards: [cardsByName.attack, cardsByName.attack, cardsByName.heal],
  },
} satisfies Record<string, PlayerInfo>;
