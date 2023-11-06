import './Card.css';

import { CardState } from '../state';

export default function Card({ card }: { card: CardState }) {
  const { text } = card;

  return <div className="Card">{text}</div>;
}
