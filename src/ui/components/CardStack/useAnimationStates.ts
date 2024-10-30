import { CardState } from '../../../game/gameState';

interface Props {
  cards: CardState[];
  currentCardIndex: number;
  trashedCards: CardState[];
}

export function useAnimationStates({ cards, currentCardIndex, trashedCards }: Props) {}
