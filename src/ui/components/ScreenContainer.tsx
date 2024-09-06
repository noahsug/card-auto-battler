import { useState } from 'react';

import { GameStateProvider, useActions, useGameState, useUndo } from './GameStateContext';
import StartScreen from './StartScreen';
import BattleScreen from './BattleScreen';
import BattleResultScreen from './BattleResultOverlay';
import OverlayBackground from './shared/OverlayBackground';

enum ScreenType {
  start,
  cardSelection,
  battle,
}

enum OverlayType {
  battleResult,
  none,
}

export default function ScreenContainer() {
  const { reset } = useActions();
  const { clearUndo } = useUndo();
  const [screen, setScreen] = useState(ScreenType.start);
  const [overlay, setOverlay] = useState(OverlayType.none);

  function handleNewGame() {
    reset();
    clearUndo();
    setScreen(ScreenType.battle);
    setOverlay(OverlayType.none);
  }

  function handleBattleOver() {
    setOverlay(OverlayType.battleResult);
  }

  function Screen() {
    switch (screen) {
      case ScreenType.start:
        return <StartScreen onNewGame={handleNewGame}></StartScreen>;

      case ScreenType.battle:
        return <BattleScreen onBattleOver={handleBattleOver}></BattleScreen>;

      // case Screen.cardSelection:
      //   return <BattleResultScreen onNewGame={handleNewGame}></BattleResultScreen>;
    }
  }

  function Overlay() {
    switch (overlay) {
      case OverlayType.battleResult:
        return <BattleResultScreen onNewGame={handleNewGame}></BattleResultScreen>;
    }
  }

  return (
    <>
      <Screen />
      {overlay !== OverlayType.none && (
        <OverlayBackground>
          <Overlay />
        </OverlayBackground>
      )}
    </>
  );
}
