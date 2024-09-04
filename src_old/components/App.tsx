import styled from 'styled-components';

import { GameStateProvider } from './GameStateContext';
import ScreenContainer from './ScreenContainer';

export default function App() {
  return (
    <Root>
      <GameStateProvider>
        <ScreenContainer />
      </GameStateProvider>
    </Root>
  );
}

const Root = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
`;
