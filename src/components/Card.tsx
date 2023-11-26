import './Card.css';

import { getActiveCard, getIsOpponentTurn } from '../state/game';
import { useGame } from './GameContext';

type Props = { isOpponent: boolean };

export default function Card({ isOpponent }: Props) {
  const game = useGame();
  const player = isOpponent ? game.opponent : game.user;
  const isOpponentTurn = getIsOpponentTurn(game);

  const isActive = isOpponent ? isOpponentTurn : !isOpponentTurn;
  const { text } = getActiveCard(player);

  let className = 'Card';
  if (isActive) {
    className += ' Card-active';
  }

  return <div className={className}>{text}</div>;
}
