import { useState } from 'react';
import { styled } from 'styled-components';

import { getBattleWinner, isGameOver } from '../../game/utils';
import BattleResultScreen from './BattleResultOverlay';
import BattleScreen from './BattleScreen';
import { useActions, useGameState, useUndo } from './GameStateContext';
import OverlayBackground from './shared/OverlayBackground';
import StartScreen from './StartScreen';

type ScreenType = 'start' | 'cardSelection' | 'battle';
type OverlayType = 'battleResult' | 'none';

export const ScreenContainerRoot = styled.div`
  max-width: 100vh;
  margin: auto;
`;

export default function ScreenContainer() {
  const { endBattle, resetGame } = useActions();
  const { clearUndo } = useUndo();
  const game = useGameState();

  const [screen, setScreen] = useState<ScreenType>('start');
  const [overlay, setOverlay] = useState<OverlayType>('none');
  const [wonLastBattle, setWonLastBattle] = useState(false);

  function handleNextBattle() {
    if (isGameOver(game)) {
      resetGame();
    }
    clearUndo();
    setScreen('battle');
    setOverlay('none');
  }

  function handleBattleOver() {
    setWonLastBattle(getBattleWinner(game) === 'user');
    endBattle();
    setOverlay('battleResult');
  }

  return (
    <ScreenContainerRoot>
      {screen === 'start' && <StartScreen onContinue={handleNextBattle}></StartScreen>}

      {screen === 'battle' && (
        <BattleScreen
          onBattleOver={handleBattleOver}
          hasOverlay={overlay !== 'none'}
        ></BattleScreen>
      )}

      {overlay !== 'none' && (
        <OverlayBackground>
          {overlay === 'battleResult' && (
            <BattleResultScreen
              wonLastBattle={wonLastBattle}
              onContinue={handleNextBattle}
            ></BattleResultScreen>
          )}
        </OverlayBackground>
      )}
    </ScreenContainerRoot>
  );
}
