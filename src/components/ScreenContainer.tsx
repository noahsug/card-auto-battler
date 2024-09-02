import { styled } from 'styled-components';

import CardCollectionScreen from './CardCollectionScreen';
import GameStartScreen from './GameStartScreen';
import CardSelectionScreen from './CardSelectionScreen';
import BattleScreen from './BattleScreen';
import GameEndScreen from './GameEndScreen';
import BattleEndScreen from './BattleEndScreen';
import { useGameState } from './GameStateContext';
import { ScreenName } from '../gameState';

type ScreenMapping = {
  [K in ScreenName]: JSX.Element;
};

const screenMapping: ScreenMapping = {
  cardCollection: <CardCollectionScreen />,

  gameStart: <GameStartScreen />,
  cardSelection: <CardSelectionScreen />,
  battle: <BattleScreen />,
  battleEnd: <BattleEndScreen />,
  gameEnd: <GameEndScreen />,
};

export default function ScreenContainer() {
  const game = useGameState();
  const { screen } = game;

  const screenComponent = screenMapping[screen];
  return <Root>{screenComponent}</Root>;
}

const Root = styled.div`
  font-size: 24rem;
  height: 100%;
  user-select: none;
  max-width: 100vh;
`;
