import { styled } from 'styled-components';

import { createGameState } from '../../../game/gameState';
import { GameStateProvider } from '../GameStateContext';
import { ScreenContainer } from '../ScreenContainer';
import backgroundImage from './main-background.png';

export const AppRoot = styled.div`
  width: 100vw;
  height: 100vh;
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
`;

// TODO: Remove GameStateProvider and ScreenContainer and put the logic here and in useUndo hook
export function App() {
  const gameState = createGameState();

  return (
    <GameStateProvider gameState={gameState}>
      <AppRoot>
        <ScreenContainer />
      </AppRoot>
    </GameStateProvider>
  );
}
