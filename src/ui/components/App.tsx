import { styled } from 'styled-components';

import { GameStateProvider } from './GameStateContext';
import ScreenContainer from './ScreenContainer';
import backgroundImage from '../images/main-background.png';
import { createGameState } from '../../game/gameState';

export const AppRoot = styled.div`
  width: 100vw;
  height: 100vh;
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

export default function App() {
  const gameState = createGameState();

  return (
    <GameStateProvider gameState={gameState}>
      <AppRoot>
        <ScreenContainer />
      </AppRoot>
    </GameStateProvider>
  );
}
