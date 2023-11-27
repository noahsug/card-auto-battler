import { useEffect } from 'react';

import './CardSelectionScreen.css';

import { MAX_WINS, MAX_LOSSES, getCardSelections } from '../state/game';
import { useGame, useActions } from './GameContext';

export default function CardSelectionScreen() {
  const game = useGame();
  const { startRound } = useActions();

  const { input, user, wins, losses } = game;

  useEffect(() => {
    if (input.actionKeyDown) {
      startRound();
    }
  }, [input.actionKeyDown, startRound]);

  const lives = new Array(MAX_LOSSES - losses).fill('❤️').join('');

  const cards = getCardSelections();
  const cardComponents = cards.map((card) => {
    return <div>{card.text}</div>;
  });

  return (
    <div className="CardSelectionScreen">
      <div>
        Wins: {wins}/{MAX_WINS} Lives: {lives}
      </div>
      <div className="CardSelectionScreen-title">Select a Card</div>
      <div className="CardSelectionScreen-cardGrid">{cardComponents}</div>
    </div>
  );
}
