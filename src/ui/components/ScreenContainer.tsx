import { useState, useRef } from 'react';
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
    clearUndo();
    setOverlay('battleResult');
  }

  return (
    <ScreenContainerRoot>
      {screen === 'start' && <StartScreen onNewGame={handleNewGame}></StartScreen>}

      {screen === 'battle' && <BattleScreen onBattleOver={handleBattleOver}></BattleScreen>}

      {overlay !== 'none' && (
        <OverlayBackground>
          {overlay === 'battleResult' && (
            <BattleResultScreen onNewGame={handleNewGame}></BattleResultScreen>
          )}
        </OverlayBackground>
      )}
    </ScreenContainerRoot>
  );
}
