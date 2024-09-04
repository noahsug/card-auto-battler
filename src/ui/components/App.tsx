import { useState } from 'react';

import StartScreen from './StartScreen';
import GameplayScreen from './GameplayScreen';
import WinScreen from './WinScreen';

enum Screen {
  start,
  gameplay,
  win,
}

export default function App() {
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
