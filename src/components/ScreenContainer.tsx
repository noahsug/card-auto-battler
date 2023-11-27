import './ScreenContainer.css';

import GameStartScreen from './GameStartScreen';
import BattleScreen from './BattleScreen';
import GameEndScreen from './GameEndScreen';
import RoundEndScreen from './RoundEndScreen';
import { useGame } from './GameContext';

import { Game } from '../state/game';

function getScreen(game: Game) {
  switch (game.screen) {
    case 'game-start':
      return <GameStartScreen />;
    case 'battle':
      return <BattleScreen />;
    case 'round-end':
      return <RoundEndScreen />;
    case 'game-end':
      return <GameEndScreen />;
    default:
      throw new Error(`unknown screen: ${game.screen}`);
  }
}

export default function ScreenContainer() {
  const game = useGame();

  const screen = getScreen(game);

  return <div className="ScreenContainer">{screen}</div>;
}
