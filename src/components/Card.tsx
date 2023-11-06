import './Card.css';

import { CardState } from '../state/card';

export default function Card({ card }: { card: CardState }) {
  const { text } = card;

  return <div className="Card">{text}</div>;
}
