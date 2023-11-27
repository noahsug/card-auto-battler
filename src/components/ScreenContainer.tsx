import './ScreenContainer.css';

import GameStartScreen from './GameStartScreen';
import CardSelectionScreen from './CardSelectionScreen';
import BattleScreen from './BattleScreen';
import GameEndScreen from './GameEndScreen';
import RoundEndScreen from './RoundEndScreen';
import { useGame } from './GameContext';

import { Screen } from '../state/game';

type ScreenMapping = {
  [K in Screen]: JSX.Element;
};

const screenMapping: ScreenMapping = {
  'game-start': <GameStartScreen />,
  'card-selection': <CardSelectionScreen />,
  battle: <BattleScreen />,
  'round-end': <RoundEndScreen />,
  'game-end': <GameEndScreen />,
};

export default function ScreenContainer() {
  const game = useGame();

  const screenComponent = screenMapping[game.screen];

  return <div className="ScreenContainer">{screenComponent}</div>;
}
