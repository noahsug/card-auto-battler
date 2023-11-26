import './ScreenManager.css';

import BattleScreen from './BattleScreen';
import GameOverScreen from './GameOverScreen';
import { useGame } from './GameContext';

import { Game } from '../state/game';

function getScreen(game: Game) {
  if (game.user.health <= 0 || game.opponent.health <= 0) {
    return <GameOverScreen />;
  }

  return <BattleScreen />;
}

export default function ScreenManager() {
  const game = useGame();

  const screen = getScreen(game);

  return <div className="ScreenManager">{screen}</div>;
}
