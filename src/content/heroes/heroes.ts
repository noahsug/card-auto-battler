import warrior from './images/warrior.png';
import { PlayerInfo } from '../../game/gameState';
import { cardsByName } from '../cards';

export const heroesByName = {
  warrior: {
    name: 'Warrior',
    image: warrior,
    cards: [cardsByName.attack, cardsByName.attack, cardsByName.heal],
    health: 30,
  },
} satisfies Record<string, PlayerInfo>;
