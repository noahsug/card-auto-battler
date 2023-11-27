import './Card.css';

import { getActiveCard, getIsOpponentTurn } from '../state/game';
import { useGame } from './GameContext';

interface Props {
  isOpponent: boolean;
  forceInactive: boolean;
}

export default function Card({ isOpponent, forceInactive }: Props) {
  const game = useGame();

  const isOpponentTurn = getIsOpponentTurn(game);
  const isActive = !forceInactive && (isOpponent ? isOpponentTurn : !isOpponentTurn);

  const { opponent, user } = game;
  const player = isOpponent ? opponent : user;
  const { text } = getActiveCard(player);

  let className = 'Card';
  if (isActive) {
    className += ' Card-active';
  }

  return <div className={className}>{text}</div>;
}
