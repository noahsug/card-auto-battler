import { styled } from 'styled-components';

import { GameStateProvider } from './GameStateContext';
import ScreenContainer from './ScreenContainer';
import backgroundImage from '../images/chalkboard-background.png';

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
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
  width: 100vw;
  height: 100vh;
`;
