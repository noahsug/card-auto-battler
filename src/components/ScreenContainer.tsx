import styled from 'styled-components';

import GameStartScreen from './GameStartScreen';
import CardSelectionScreen from './CardSelectionScreen';
import BattleScreen from './BattleScreen';
import GameEndScreen from './GameEndScreen';
import RoundEndScreen from './RoundEndScreen';
import { useGame } from './GameContext';
import { Screen as ScreenState } from '../gameState';

type ScreenMapping = {
  [K in ScreenState]: JSX.Element;
};

const screenMapping: ScreenMapping = {
  // 'game-start': <GameEndScreen />, // DEBUG

  'game-start': <GameStartScreen />,
  'card-selection': <CardSelectionScreen />,
  battle: <BattleScreen />,
  'round-end': <RoundEndScreen />,
  'game-end': <GameEndScreen />,
};

export default function ScreenContainer() {
  const game = useGame();
  const { screen } = game;

  const screenComponent = screenMapping[screen];
  return <Root>{screenComponent}</Root>;
}

const Root = styled.div`
  font-size: 24rem;
  height: 100%;
  user-select: none;
`;
