import { styled } from 'styled-components';
import { useState } from 'react';

import { GameStateProvider } from './GameStateContext';
import StartScreen from './StartScreen';
import GameplayScreen from './GameplayScreen';
import WinScreen from './WinScreen';

enum Screen {
  start,
  gameplay,
  win,
}

function ScreenContainer() {
  const [screen, setScreen] = useState(Screen.start);

  function handleNewGame() {
    setScreen(Screen.gameplay);
  }

  function handleWin() {
    setScreen(Screen.win);
  }

  function handleLose() {
    setScreen(Screen.start);
  }

  switch (screen) {
    case Screen.start:
      return <StartScreen onNewGame={handleNewGame}></StartScreen>;

    case Screen.gameplay:
      return <GameplayScreen onWin={handleWin} onLose={handleLose}></GameplayScreen>;

    case Screen.win:
      return <WinScreen onNewGame={handleNewGame}></WinScreen>;
  }
}

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
  align-items: center;
`;
