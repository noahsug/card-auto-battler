import { useEffect } from 'react';
import styled from 'styled-components';

import './CardSelectionScreen.css';

import { MAX_WINS, MAX_LOSSES, getCardSelections } from '../state/game';
import { useGame, useActions } from './GameContext';
import rel from './shared/rel';
import Card from './Card';

export default function CardSelectionScreen() {
  const game = useGame();
  const { startRound } = useActions();

  const { input, wins, losses } = game;

  useEffect(() => {
    if (input.actionKeyDown) {
      startRound();
    }
  }, [input.actionKeyDown, startRound]);

  const lives = new Array(MAX_LOSSES - losses).fill('❤️').join('');

  const cards = getCardSelections();
  const cardComponents = cards.map((card) => {
    return <Card card={card} scale={0.75} />;
  });

  return (
    <div className="CardSelectionScreen">
      <div>
        Wins: {wins}/{MAX_WINS} Lives: {lives}
      </div>
      <div className="CardSelectionScreen-title">Select a Card</div>
      <CardGrid>{cardComponents}</CardGrid>
    </div>
  );
}

const CardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  div {
    margin: ${rel(2)};
  }
`;
