import styled from 'styled-components';

import GameStartScreen from './GameStartScreen';
import CardSelectionScreen from './CardSelectionScreen';
import BattleScreen from './BattleScreen';
import GameEndScreen from './GameEndScreen';
import RoundEndScreen from './RoundEndScreen';
import { useGame } from './GameContext';
import rel from './shared/rel';
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
  // const screenComponent = screenMapping['battle']; // DEBUG

  return <Container>{screenComponent}</Container>;
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  font-size: ${rel(24)};
`;
