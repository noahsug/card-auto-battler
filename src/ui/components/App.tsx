import { styled } from 'styled-components';

import { GameStateProvider } from './GameStateContext';
import ScreenContainer from './ScreenContainer';

export default function App() {
  return (
    <GameStateProvider>
      <Root>
        <ScreenContainer />
      </Root>
    </GameStateProvider>
  );
}

const Root = styled.div`
  max-width: 100vh;
  margin: auto;
`;
