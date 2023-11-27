import { useEffect } from 'react';

import './RoundEndScreen.css';

import { MAX_WINS, MAX_LOSSES } from '../state/game';
import { useGame, useActions } from './GameContext';

export default function RoundEndScreen() {
  const game = useGame();
  const { startRound } = useActions();

  const { input, user, wins, losses } = game;

  useEffect(() => {
    if (input.actionKeyDown) {
      startRound();
    }
  }, [input.actionKeyDown, startRound]);

  const isWin = user.health > 0;
  const title = isWin ? 'Victory' : 'Defeat';

  const lives = new Array(MAX_LOSSES - losses).fill('❤️').join('');

  return (
    <div className="RoundEndScreen">
      <div className="RoundEndScreen-title">{title}</div>
      <div>
        Wins: {wins}/{MAX_WINS} Lives: {lives}
      </div>
      <div className="RoundEndScreen-subtitle">
        Next Fight?
      </div>
    </div>
  );
}
