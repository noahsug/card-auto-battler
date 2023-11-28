import styled from 'styled-components';

import { GameProvider } from './GameContext';
import InputTracker from './InputTracker';
import ScreenContainer from './ScreenContainer';

export default function App() {
  return (
    <Root>
      <GameProvider>
        <InputTracker />
        <ScreenContainer />
      </GameProvider>
    </Root>
  );
}

const Root = styled.div`
  width: 100%;
  height: 100%;
`;
