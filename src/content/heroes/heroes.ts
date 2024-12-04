import warrior from './images/warrior.png';
import { PlayerInfo } from '../../game/gameState';
import { cardsByType } from '../cards';
import { noop } from '../../utils/functions';

export const heroesByName = {
  warrior: {
    name: 'Warrior',
    image: warrior,
    cards: [cardsByType.attack, cardsByType.attack, cardsByType.heal],
    health: 30,
    scale: 0.85,
  },
} satisfies Record<string, PlayerInfo>;
