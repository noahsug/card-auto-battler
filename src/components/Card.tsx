import './Card.css';

import { Card as CardState } from '../state/game';

type Props =  { card: CardState }

export default function Card({ card }: Props) {
  const { text } = card;

  return <div className="Card">{text}</div>;
}
