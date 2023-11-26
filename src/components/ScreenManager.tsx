import './ScreenManager.css';

import BattleScreen from './BattleScreen';
import GameOverScreen from './GameOverScreen';
import { useGame } from './GameContext';

import { Game } from '../state/game';

function getScreen(game: Game) {
  switch (game.screen) {
    case 'gameOver':
      return <GameOverScreen />;
    case 'battle':
      return <BattleScreen />;
    default:
      throw new Error(`unknown screen: ${game.screen}`);
  }
}

export default function ScreenManager() {
  const game = useGame();

  const screen = getScreen(game);

  return <div className="ScreenManager">{screen}</div>;
}
