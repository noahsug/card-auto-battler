import { useEffect } from 'react';

import './RoundEndScreen.css';

import { useGame, useActions } from './GameContext';
import ProgressDisplay from './ProgressDisplay';

export default function RoundEndScreen() {
  const game = useGame();
  const { startCardSelection } = useActions();

  const { input, user } = game;

  useEffect(() => {
    if (input.actionKeyDown) {
      startCardSelection();
    }
  }, [input.actionKeyDown, startCardSelection]);

  const isWin = user.health > 0;
  const title = isWin ? 'Victory' : 'Defeat';

  return (
    <div className="RoundEndScreen">
      <div className="RoundEndScreen-title">{title}</div>
      <ProgressDisplay />
      <div className="RoundEndScreen-subtitle">Next Fight?</div>
    </div>
  );
}
