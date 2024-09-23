import { useState } from 'react';
import { styled } from 'styled-components';

import { useActions, useUndo } from './GameStateContext';
import StartScreen from './StartScreen';
import BattleScreen from './BattleScreen';
import BattleResultScreen from './BattleResultOverlay';
import OverlayBackground from './shared/OverlayBackground';

type ScreenType = 'start' | 'cardSelection' | 'battle';
type OverlayType = 'battleResult' | 'none';

export const ScreenContainerRoot = styled.div`
  max-width: 100vh;
  margin: auto;
`;

export default function ScreenContainer() {
  const { resetBattle } = useActions();
  const { clearUndo } = useUndo();
  const [screen, setScreen] = useState<ScreenType>('start');
  const [overlay, setOverlay] = useState<OverlayType>('none');

  function handleNewGame() {
    resetBattle();
    clearUndo();
    setScreen('battle');
    setOverlay('none');
  }

  function handleBattleOver() {
    setOverlay('battleResult');
  }

  function Screen() {
    switch (screen) {
      case 'start':
        return <StartScreen onNewGame={handleNewGame}></StartScreen>;

      case 'battle':
        return <BattleScreen onBattleOver={handleBattleOver}></BattleScreen>;

      // case Screen.cardSelection:
      //   return <BattleResultScreen onNewGame={handleNewGame}></BattleResultScreen>;
    }
  }

  function Overlay() {
    switch (overlay) {
      case 'battleResult':
        return <BattleResultScreen onNewGame={handleNewGame}></BattleResultScreen>;
    }
  }

  return (
    <ScreenContainerRoot>
      <Screen />
      {overlay !== 'none' && (
        <OverlayBackground>
          <Overlay />
        </OverlayBackground>
      )}
    </ScreenContainerRoot>
  );
}
