import { PlayerInfo } from '../../game/gameState';
import { cardsByType } from '../cards';
import warrior from './images/warrior.png';

export const heroesByType = {
  warrior: {
    name: 'Warrior',
    image: warrior,
    cards: [cardsByType.attack, cardsByType.attack, cardsByType.heal],
    health: 30,
    scale: 0.85,
  },
} satisfies Record<string, PlayerInfo>;
