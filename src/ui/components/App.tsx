import { styled } from 'styled-components';

import { GameStateProvider } from './GameStateContext';
import ScreenContainer from './ScreenContainer';
import backgroundImage from '../images/main-background.png';
import { createGameState } from '../../game/gameState';

export default function App() {
  const gameState = createGameState();

  return (
    <GameStateProvider gameState={gameState}>
      <Root>
        <ScreenContainer />
      </Root>
    </GameStateProvider>
  );
}

const Root = styled.div`
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
  width: 100vw;
  height: 100vh;
`;
